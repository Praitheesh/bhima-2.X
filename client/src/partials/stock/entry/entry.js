angular.module('bhima.controllers')
  .controller('StockEntryController', StockEntryController);

// dependencies injections
StockEntryController.$inject = [
  'DepotService', 'InventoryService', 'NotifyService',
  'SessionService', 'util', 'bhConstants', 'ReceiptModal', 'PurchaseOrderService',
  'StockFormService', 'StockService', 'StockModalService', 'uiGridGroupingConstants',
  'uiGridConstants',
];

/**
 * StockEntryController
 * @description This controller is responsible to handle stock entry module
 */
function StockEntryController(Depots, Inventory, Notify,
  Session, util, bhConstants, ReceiptModal, Purchase,
  StockForm, Stock, StockModal, uiGridGroupingConstants, uiGridConstants) {
  var vm = this;
  var mapEntry = {
    purchase    : { find: findPurchase, submit: submitPurchase },
    donation    : { find: angular.noop, submit: angular.noop },
    integration : { find: angular.noop, submit: submitIntegration },
  };

  vm.Stock = new StockForm('StockEntry');
  vm.depot = {};
  vm.movement = {};

  // bind methods
  vm.itemIncrement = 1;
  vm.enterprise = Session.enterprise;
  vm.maxLength = util.maxLength;
  vm.addItems = addItems;
  vm.removeItem = removeItem;
  vm.maxDate = new Date();
  vm.selectEntryType = selectEntryType;
  vm.setupDepot = setupDepot;
  vm.configureItem = configureItem;
  vm.setLots = setLots;
  vm.submit = submit;

  // grid options
  var gridOptions = {
    appScopeProvider  : vm,
    enableSorting     : false,
    enableColumnMenus : false,
    columnDefs        : [
      { field        : 'status',
        width        : 25,
        displayName  : '',
        cellTemplate : 'partials/stock/entry/templates/status.tmpl.html' },

      { field            : 'code',
        width            : 120,
        displayName      : 'TABLE.COLUMNS.CODE',
        headerCellFilter : 'translate',
        cellTemplate     : 'partials/stock/entry/templates/code.tmpl.html' },

      { field            : 'description',
        displayName      : 'TABLE.COLUMNS.DESCRIPTION',
        headerCellFilter : 'translate',
        cellTemplate     : 'partials/stock/entry/templates/description.tmpl.html' },

      { field            : 'lot',
        width            : 150,
        displayName      : 'TABLE.COLUMNS.LOT',
        headerCellFilter : 'translate',
        cellTemplate     : 'partials/stock/entry/templates/lot.tmpl.html' },

      { field            : 'quantity',
        width            : 150,
        displayName      : 'TABLE.COLUMNS.QUANTITY',
        headerCellFilter : 'translate',
        cellTemplate     : 'partials/stock/entry/templates/quantity.tmpl.html',
        aggregationType  : uiGridConstants.aggregationTypes.sum },

      { field: 'actions', width: 25, cellTemplate: 'partials/stock/entry/templates/actions.tmpl.html' },
    ],
    onRegisterApi : onRegisterApi,
    data          : vm.Stock.store.data,
  };

  vm.gridOptions = gridOptions;

  // expose the API so that scrolling methods can be used
  function onRegisterApi(api) {
    vm.gridApi = api;
  }

  // entry type
  function selectEntryType(entryType) {
    vm.movement.entry_type = entryType;
    mapEntry[entryType].find();
  }

  // configure depot
  function setupDepot(depot) {
    if (!depot || !depot.uuid) { return; }
    vm.depot = depot;
    loadInventories();
    vm.Stock.setup();
    vm.Stock.store.clear();
  }

  // configure items
  function configureItem(item) {
    item._initialised = true;
  }

  // add items
  function addItems(n) {
    vm.Stock.addItems(n);
    hasValidInput();
  }

  // remove item
  function removeItem(item) {
    vm.Stock.removeItem(item.index);
    hasValidInput();
  }

  // init actions
  function moduleInit() {
    vm.movement = { date: new Date(), entity: {} };
    loadInventories();
    setupDepot(vm.depot);
  }

  // ============================ Inventories ==========================
  function loadInventories() {
    Inventory.read()
      .then((inventories) => {
        vm.inventories = inventories;
      })
      .catch(Notify.errorHandler);
  }

  // ============================ Modals ================================
  // find purchase
  function findPurchase() {
    StockModal.openFindPurchase()
    .then(function(purchase) {
      if (!purchase) { return; }
      vm.movement.entity = {
        uuid     : purchase[0].uuid,
        type     : 'purchase',
        instance : purchase[0],
      };
      populate(purchase);
    })
    .catch(Notify.errorHandler);
  }

  // populate the grid
  function populate(items) {
    if (!items.length) { return; }

    vm.Stock.addItems(items.length);

    try {
      vm.Stock.store.data.forEach(function (item, index) {
        item.inventory = findInventory(items[index].inventory_uuid);
        item.unit_cost = items[index].unit_price;
        item.quantity = items[index].balance;
        item.cost = item.quantity * item.unit_cost;
        configureItem(item);
      });
    } catch (err) {
      Notify.errorHandler(err);
    }
  }

  function findInventory(uuid) {
    if (!vm.inventories.length) { return; }

    for (var i = 0; i <= vm.inventories.length; i++) {
      if (vm.inventories[i].uuid === uuid) {
        return vm.inventories[i];
      }
    }
  }

  // ============================ lots management ===========================
  function setLots(inventory) {
    StockModal.openDefineLots({
      inventory  : inventory,
      entry_type : vm.movement.entry_type,
    })
    .then(function (rows) {
      if (!rows) { return; }
      inventory.lots = rows.lots;
      inventory.givenQuantity = rows.quantity;
      vm.hasValidInput = hasValidInput();
    })
    .catch(Notify.errorHandler);
  }

  // validation
  function hasValidInput() {
    return vm.Stock.store.data.every(function (line) {
      return line.lots.length > 0;
    });
  }

  // ================================ submit ================================
  function submit(form) {
    if (form.$invalid) { return; }
    mapEntry[vm.movement.entry_type].submit();
  }

  // submit purchase
  function submitPurchase() {
    var movement = {
      depot_uuid  : vm.depot.uuid,
      entity_uuid : vm.movement.entity.uuid,
      date        : vm.movement.date,
      description : vm.movement.description,
      flux_id     : bhConstants.flux.FROM_PURCHASE,
      user_id     : Session.user.id,
    };

    var lots = vm.Stock.store.data.reduce(function (current, previous) {
      return previous.lots.map(function (lot) {
        return {
          label            : lot.lot,
          initial_quantity : lot.quantity,
          quantity         : lot.quantity,
          unit_cost        : previous.unit_cost,
          expiration_date  : lot.expiration_date,
          inventory_uuid   : previous.inventory.uuid,
          origin_uuid      : vm.movement.entity.uuid,
        };
      }).concat(current);
    }, []);

    movement.lots = lots;

    Stock.stocks.create(movement)
    .then(function (document) {
      Purchase.stockStatus(vm.movement.entity.uuid);
      return document;
    })
    .then(function (document) {
      vm.Stock.store.clear();
      vm.movement = {};
      ReceiptModal.stockEntryPurchaseReceipt(document.uuid, bhConstants.flux.FROM_PURCHASE);
    })
    .catch(Notify.errorHandler);
  }

  // submit integration
  function submitIntegration() {
    var movement = {
      depot_uuid  : vm.depot.uuid,
      entity_uuid : vm.movement.entity.uuid,
      date        : vm.movement.date,
      description : vm.movement.description,
      flux_id     : bhConstants.flux.FROM_INTEGRATION,
      user_id     : Session.user.id,
    };

    Stock.integration.create({ description : vm.movement.description })
    .then(function (uuid) {
      var lots = vm.Stock.store.data.reduce(function (current, previous) {
        return previous.lots.map(function (lot) {
          return {
            label            : lot.lot,
            initial_quantity : lot.quantity,
            quantity         : lot.quantity,
            unit_cost        : previous.unit_cost,
            expiration_date  : lot.expiration_date,
            inventory_uuid   : previous.inventory.uuid,
            origin_uuid      : uuid,
          };
        }).concat(current);
      }, []);

      movement.lots = lots;
      return Stock.stocks.create(movement);
    })
    .then(function (document) {
      vm.Stock.store.clear();
      vm.movement = {};
      // Add integration receipt
      // ReceiptModal.stockEntryPurchaseReceipt(document.uuid, bhConstants.flux.FROM_PURCHASE);
    })
    .catch(Notify.errorHandler);
  }

  moduleInit();
}
