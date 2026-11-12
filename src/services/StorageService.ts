import localforage from 'localforage';

/**
 * Storage configuration for customer and invoice stores.
 */
class StorageService {
  private static instance: StorageService;
  public readonly customerStore: LocalForage;
  public readonly invoiceStore: LocalForage;

  private constructor() {
    // Configure main database
    localforage.config({
      name: 'billing_app_db',
      driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
      description: 'Client-side storage for customers and invoices',
    });

    // Create separate store instances for Customers and Invoices
    this.customerStore = localforage.createInstance({
      name: 'billing_app_db',
      storeName: 'customers',
      description: 'Customer records with multi-step profile data',
    });

    this.invoiceStore = localforage.createInstance({
      name: 'billing_app_db',
      storeName: 'invoices',
      description: 'Billing invoices linked to customers',
    });
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }
}

export const storageService = StorageService.getInstance();
