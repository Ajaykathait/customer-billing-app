import { useState } from "react";
import { useCustomers } from "./hooks/useCustomers";
import { useInvoices } from "./hooks/useInvoices";
import type { Customer, CustomerFormData } from "./types/customer";
import type { Invoice, InvoiceFormData } from "./types/invoice";
import { Header } from "./components/layout/Header";
import { CustomerList } from "./components/customers/CustomerList";
import { CustomerFormModal } from "./components/customers/CustomerFormModal";
import { CustomerDetailModal } from "./components/customers/CustomerDetailModal";
import { InvoiceCreationForm } from "./components/billing/InvoiceCreationForm";
import { InvoiceListTable } from "./components/billing/InvoiceListTable";
import { InvoiceDetailModal } from "./components/billing/InvoiceDetailModal";
import { CheckCircle2 } from "lucide-react";

export function App() {
  const [activeTab, setActiveTab] = useState<"billing" | "customers">(
    "billing",
  );
  const [isCustomerModalOpen, setIsCustomerModalOpen] =
    useState<boolean>(false);
  const [selectedCustomerForView, setSelectedCustomerForView] =
    useState<Customer | null>(null);
  const [selectedInvoiceForView, setSelectedInvoiceForView] =
    useState<Invoice | null>(null);
  const [preselectedCustomerId, setPreselectedCustomerId] =
    useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const customerState = useCustomers();
  const invoiceState = useInvoices();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleCreateCustomer = async (data: CustomerFormData) => {
    const created = await customerState.addCustomer(data);
    showToast(`Customer "${created.name}" created successfully!`);
  };

  const handleCreateInvoice = async (data: InvoiceFormData) => {
    const created = await invoiceState.addInvoice(data);
    showToast(`Invoice ${created.invoiceNumber} created successfully!`);
  };

  const handleCreateInvoiceForCustomer = (customer: Customer) => {
    setPreselectedCustomerId(customer.id);
    setActiveTab("billing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTabChange = (tab: "billing" | "customers") => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-medium animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <Header
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        onOpenNewCustomer={() => setIsCustomerModalOpen(true)}
        customerCount={customerState.customers.length}
        invoiceCount={invoiceState.invoices.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "billing" && (
          <div className="space-y-8">
            <InvoiceCreationForm
              customers={customerState.customers}
              preselectedCustomerId={preselectedCustomerId}
              onInvoiceCreated={handleCreateInvoice}
              onNavigateToCustomerCreation={() => setIsCustomerModalOpen(true)}
            />
            <InvoiceListTable
              invoices={invoiceState.filteredInvoices}
              customers={customerState.customers}
              selectedCustomerId={invoiceState.selectedCustomerId}
              onSelectCustomerId={invoiceState.setSelectedCustomerId}
              statusFilter={invoiceState.statusFilter}
              onSelectStatusFilter={invoiceState.setStatusFilter}
              searchQuery={invoiceState.searchQuery}
              onSearchChange={invoiceState.setSearchQuery}
              onToggleStatus={invoiceState.toggleInvoiceStatus}
              onDeleteInvoice={invoiceState.deleteInvoice}
              onViewInvoice={setSelectedInvoiceForView}
            />
          </div>
        )}
        {activeTab === "customers" && (
          <CustomerList
            customers={customerState.customers}
            paginatedCustomers={customerState.paginatedCustomers}
            searchQuery={customerState.searchQuery}
            setSearchQuery={customerState.setSearchQuery}
            sortField={customerState.sortField}
            setSortField={customerState.setSortField}
            sortDirection={customerState.sortDirection}
            setSortDirection={customerState.setSortDirection}
            currentPage={customerState.currentPage}
            setCurrentPage={customerState.setCurrentPage}
            pageSize={customerState.pageSize}
            setPageSize={customerState.setPageSize}
            totalPages={customerState.totalPages}
            onOpenCreateModal={() => setIsCustomerModalOpen(true)}
            onSelectCustomerToView={setSelectedCustomerForView}
            onCreateInvoiceForCustomer={handleCreateInvoiceForCustomer}
            onDeleteCustomer={customerState.deleteCustomer}
          />
        )}
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500"></footer>

      <CustomerFormModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSubmit={handleCreateCustomer}
      />

      <CustomerDetailModal
        customer={selectedCustomerForView}
        isOpen={Boolean(selectedCustomerForView)}
        onClose={() => setSelectedCustomerForView(null)}
        onCreateInvoiceForCustomer={handleCreateInvoiceForCustomer}
      />

      <InvoiceDetailModal
        invoice={selectedInvoiceForView}
        isOpen={Boolean(selectedInvoiceForView)}
        onClose={() => setSelectedInvoiceForView(null)}
        onToggleStatus={invoiceState.toggleInvoiceStatus}
      />
    </div>
  );
}

export default App;
