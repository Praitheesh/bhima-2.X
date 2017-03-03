angular.module('bhima.services')
  .service('ReceiptModal', ReceiptModal);

ReceiptModal.$inject = ['$uibModal', 'ReceiptService'];

/**
 * Receipts Modal Service
 *
 * This service is responsible for combining receipt service data with the
 * receipts modal controller and providing a clean interface to be used within
 * module controllers.
 *
 * @module services/receipts/ReceiptModal
 */
function ReceiptModal(Modal, Receipts) {
  var service = this;

  var modalConfiguration = {
    templateUrl : '/js/services/receipts/modal/receiptModal.tmpl.html',
    controller  : 'ReceiptModalController as ReceiptCtrl',
    size        : 'md',
    backdrop    : 'static',
    animation   : false
  };

  // expose available receipts
  service.invoice = invoice;
  service.patient = patient;
  service.purchase = purchase;
  service.cash = cash;
  service.transaction = transaction;
  service.payroll = payroll;
  service.voucher = voucher;
  service.creditNote = creditNote;
  service.accountSlip = accountSlip;

  /**
   * Invokes a patient invoice receipt
   *
   * @param {String} uuid             Target invoice UUID
   * @param {Boolean} notifyCreated   Defines if a success message should be shown for entity creation
   */
  function invoice(uuid, notifyCreated) {

    /** @todo Discuss if these should be overridable from the controller or if the config should be set here */
    var options = {
      title         : 'PATIENT_INVOICE.PAGE_TITLE',
      createdKey    : 'PATIENT_INVOICE.SUCCESS',
      identifier    : 'reference',
      renderer      : Receipts.renderers.PDF,
      notifyCreated : notifyCreated
    };

    var receiptOptions = {
      renderer : Receipts.renderers.PDF,
      currency : Receipts.receiptCurrency
    };

    var invoiceRequest = Receipts.invoice(uuid, receiptOptions);
    var invoiceProvider = {
      resolve : {
        receipt : function receiptProvider() { return { promise: invoiceRequest }; },
        options : function optionsProvider() { return options; },
      }
    };

    var configuration = angular.extend(modalConfiguration, invoiceProvider);
    var instance = Modal.open(configuration);
    return instance.result;
  }

  /**
   * Invokes a patient card for printing.
   *
   * @param {String} uuid             Target patient UUID
   * @param {Boolean} notifyCreated   Defines if a success message should be shown for entity creation
   */
  function patient(uuid, notifyCreated, userOptions) {

    var options = {
      title         : 'PATIENT_REG.PAGE_TITLE',
      createdKey    : 'PATIENT_REG.SUCCESS',
      identifier    : 'reference',
      renderer      : Receipts.renderers.PDF,
      notifyCreated : notifyCreated
    };

    var receiptOptions = {
      renderer : Receipts.renderers.PDF
    };

    angular.extend(receiptOptions, userOptions);

    var patientRequest = Receipts.patient(uuid, receiptOptions);
    var patientProvider = {
      resolve : {
        receipt : function receiptProvider() { return { promise: patientRequest }; },
        options : function optionsProvider() { return options; },
      }
    };

    var configuration = angular.extend(modalConfiguration, patientProvider);
    var instance = Modal.open(configuration);
    return instance.result;
  }


  /**
   * Invokes a purchase order receipt
   *
   * @param {String} uuid             Target purchase order UUID
   * @param {Boolean} notifyCreated   Defines if a success message should be shown for entity creation
   */
  function purchase(uuid, notifyCreated) {
    var options = {
      title         : 'PURCHASES.PAGE_TITLE',
      createdKey    : 'PURCHASES.RECEIPT.SUCCESS',
      identifier    : 'reference',
      renderer      : Receipts.renderers.PDF,
      notifyCreated : notifyCreated
    };

    var purchaseRequest = Receipts.purchase(uuid, { renderer: options.renderer });
    var reportProvider = {
      resolve : {
        receipt : function receiptProvider() { return { promise: purchaseRequest}; },
        options : function optionsProvider() { return options; },
      }
    };

    var configuration = angular.extend(modalConfiguration, reportProvider);
    var instance = Modal.open(configuration);
    return instance.result;
  }

  /**
   * Invokes a cash payment receipt
   *
   * @param {String} uuid             Target cash payment UUID
   * @param {Boolean} notifyCreated   Defines if a success message should be shown for entity creation
   */
  function cash(uuid, notifyCreated) {
    var options = {
      title         : 'CASH.TITLE',
      createdKey    : 'CASH.RECEIPT.SUCCESS',
      identifier    : 'reference', // @todo - what does this do?
      renderer      : Receipts.renderers.PDF,
      notifyCreated : notifyCreated
    };

    var cashRequest = Receipts.cash(uuid, { renderer: options.renderer });
    var reportProvider = {
      resolve : {
        receipt : function receiptProvider() { return { promise: cashRequest }; },
        options : function optionsProvider() { return options; },
      },
      keyboard : false
    };

    var configuration = angular.extend(modalConfiguration, reportProvider);
    var instance = Modal.open(configuration);
    return instance.result;
  }


  /**
   * @method voucher
   *
   * @description
   * Invokes a journal voucher receipt.
   *
   * @param {String} uuid             Target journal voucher UUID
   * @param {Boolean} notifyCreated   Defines if a success message should be shown for entity creation
   */
  function voucher(uuid, notifyCreated) {
    var options = {
      title         : 'VOUCHERS.GLOBAL.TITLE',
      createdKey    : 'VOUCHERS.GLOBAL.RECEIPT.SUCCESS',
      identifier    : 'reference', // @todo - what does this do?
      renderer      : Receipts.renderers.PDF,
      notifyCreated : notifyCreated
    };

    var voucherRequest = Receipts.voucher(uuid, { renderer: options.renderer });
    var reportProvider = {
      resolve : {
        receipt : function receiptProvider() { return { promise: voucherRequest }; },
        options : function optionsProvider() { return options; },
      }
    };

    var configuration = angular.extend(modalConfiguration, reportProvider);
    var instance = Modal.open(configuration);
    return instance.result;
  }

  /**
   * Invokes an invoice's credit note
   *
   * @param {String} uuid             Target invoice UUID
   * @param {Boolean} notifyCreated   Defines if a success message should be shown for entity creation
   */
  function creditNote(uuid, notifyCreated, userOptions) {

    /** @todo Discuss if these should be overridable from the controller or if the config should be set here */
    var options = {
      title         : 'TREE.CREDIT_NOTE',
      createdKey    : 'PATIENT_INVOICE.SUCCESS',
      identifier    : 'reference',
      renderer      : Receipts.renderers.PDF,
      notifyCreated : notifyCreated
    };

    var receiptOptions = {
      renderer : Receipts.renderers.PDF
    };

    angular.extend(receiptOptions, userOptions);

    var creditNoteRequest = Receipts.creditNote(uuid, receiptOptions);
    var creditNoteProvider = {
      resolve : {
        receipt : function receiptProvider() { return { promise: creditNoteRequest }; },
        options : function optionsProvider() { return options; },
      }
    };

    var configuration = angular.extend(modalConfiguration, creditNoteProvider);
    var instance = Modal.open(configuration);
    return instance.result;
  }

  /**
   * @method accountSlip
   *
   * @description
   * Invokes a general ledger account slip
   *
   * @param {number} id - Target account ii
   * @param {Boolean} notifyCreated   Defines if a success message should be shown for entity creation
   */
  function accountSlip(id, notifyCreated) {
    var options = {
      title         : 'GENERAL_LEDGER.ACCOUNT_SLIP',
      // createdKey    : 'VOUCHERS.GLOBAL.RECEIPT.SUCCESS',
      // identifier    : 'reference', // @todo - what does this do?
      renderer      : Receipts.renderers.PDF,
      notifyCreated : notifyCreated
    };

    var accountSlipRequest = Receipts.accountSlip(id, { renderer: options.renderer });
    var reportProvider = {
      resolve : {
        receipt : function receiptProvider() { return { promise: accountSlipRequest }; },
        options : function optionsProvider() { return options; },
      },
    };

    var configuration = angular.extend(modalConfiguration, reportProvider);
    var instance = Modal.open(configuration);
    return instance.result;
  }

  function transaction(uuid, notifyCreated) {
    /* noop */
  }

  function payroll(uuid, notifyCreated) {
    /* noop */
  }

  // ================================ stock =====================================
  // bind methods
  service.stockExitPatientReceipt = stockExitPatientReceipt;
  service.stockExitDepotReceipt = stockExitDepotReceipt;
  service.stockEntryDepotReceipt = stockEntryDepotReceipt;
  service.stockExitServiceReceipt = stockExitServiceReceipt;
  service.stockExitLossReceipt = stockExitLossReceipt;

  /**
   * @method stockExitPatientReceipt
   * @param {string} documentUuid
   * @param {boolean} notifyCreated
   */
  function stockExitPatientReceipt(documentUuid, notifyCreated) {
    var options = {
      title         : 'STOCK.RECEIPT.EXIT_PATIENT',
      renderer      : Receipts.renderers.PDF,
      notifyCreated : notifyCreated,
    };

    var request = Receipts.stockExitPatientReceipt(documentUuid, { renderer: options.renderer });
    var reportProvider = {
      resolve : {
        receipt : function receiptProvider() { return { promise: request }; },
        options : function optionsProvider() { return options; },
      },
    };

    var configuration = angular.extend(modalConfiguration, reportProvider);
    var instance = Modal.open(configuration);
    return instance.result;
  }

  /**
   * @method stockExitLossReceipt
   * @param {string} documentUuid
   * @param {boolean} notifyCreated
   */
  function stockExitLossReceipt(documentUuid, notifyCreated) {
    var options = {
      title         : 'STOCK.RECEIPT.EXIT_LOSS',
      renderer      : Receipts.renderers.PDF,
      notifyCreated : notifyCreated,
    };

    var request = Receipts.stockExitLossReceipt(documentUuid, { renderer: options.renderer });
    var reportProvider = {
      resolve : {
        receipt : function receiptProvider() { return { promise: request }; },
        options : function optionsProvider() { return options; },
      },
    };

    var configuration = angular.extend(modalConfiguration, reportProvider);
    var instance = Modal.open(configuration);
    return instance.result;
  }

  /**
   * @method stockExitServiceReceipt
   * @param {string} documentUuid
   * @param {boolean} notifyCreated
   */
  function stockExitServiceReceipt(documentUuid, notifyCreated) {
    var options = {
      title         : 'STOCK.RECEIPT.EXIT_PATIENT',
      renderer      : Receipts.renderers.PDF,
      notifyCreated : notifyCreated,
    };

    var request = Receipts.stockExitServiceReceipt(documentUuid, { renderer: options.renderer });
    var reportProvider = {
      resolve : {
        receipt : function receiptProvider() { return { promise: request }; },
        options : function optionsProvider() { return options; },
      },
    };

    var configuration = angular.extend(modalConfiguration, reportProvider);
    var instance = Modal.open(configuration);
    return instance.result;
  }

  /**
   * @method stockExitDepotReceipt
   * @param {string} documentUuid
   * @param {boolean} notifyCreated
   */
  function stockExitDepotReceipt(documentUuid, notifyCreated) {
    var options = {
      title         : 'STOCK.RECEIPT.EXIT_DEPOT',
      renderer      : Receipts.renderers.PDF,
      notifyCreated : notifyCreated,
    };

    var request = Receipts.stockExitDepotReceipt(documentUuid, { renderer: options.renderer });
    var reportProvider = {
      resolve : {
        receipt : function receiptProvider() { return { promise: request }; },
        options : function optionsProvider() { return options; },
      },
    };

    var configuration = angular.extend(modalConfiguration, reportProvider);
    var instance = Modal.open(configuration);
    return instance.result;
  }

  /**
   * @method stockEntryDepotReceipt
   * @param {string} documentUuid
   * @param {boolean} notifyCreated
   */
  function stockEntryDepotReceipt(documentUuid, notifyCreated) {
    var options = {
      title         : 'STOCK.RECEIPT.ENTRY_DEPOT',
      renderer      : Receipts.renderers.PDF,
      notifyCreated : notifyCreated,
    };

    var request = Receipts.stockEntryDepotReceipt(documentUuid, { renderer: options.renderer });
    var reportProvider = {
      resolve : {
        receipt : function receiptProvider() { return { promise: request }; },
        options : function optionsProvider() { return options; },
      },
    };

    var configuration = angular.extend(modalConfiguration, reportProvider);
    var instance = Modal.open(configuration);
    return instance.result;
  }


  // ================================ end stock =================================

  return service;
}
