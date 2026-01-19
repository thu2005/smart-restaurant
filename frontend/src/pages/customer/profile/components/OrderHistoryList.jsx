import React, { useEffect, useState } from "react";
import OrderHistoryItem from "./OrderHistoryItem";
import orderService from "../../../../services/orderService";
import Icon from "../../../../components/AppIcon";
import Pagination from "../../../../components/ui/Pagination";

const OrderHistoryList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  useEffect(() => {
    fetchHistory(currentPage);
  }, [currentPage]);

  const fetchHistory = async (page) => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const response = await orderService.getCustomerOrderHistory({ 
        limit: limit,
        offset: offset
      });
      
      if (response.success) {
        setOrders(response.data);
        if (response.pagination) {
            setTotalPages(response.pagination.totalPages);
        }
      }
    } catch (err) {
      console.error("Failed to fetch order history", err);
      setError("Failed to load order history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">Loading purchase history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive border border-destructive/20 p-6 rounded-xl text-center">
        <Icon name="AlertCircle" size={32} className="mx-auto mb-2" />
        <p>{error}</p>
        <button 
           onClick={() => fetchHistory(currentPage)}
           className="mt-4 text-sm font-bold underline hover:no-underline"
        >
           Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-card/50 rounded-xl border border-dashed border-border">
        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center text-muted-foreground mb-4">
           <Icon name="ShoppingBag" size={32} />
        </div>
        <h3 className="text-lg font-bold text-foreground">No orders yet</h3>
        <p className="text-muted-foreground max-w-xs mx-auto mb-6">
          You haven't placed any orders yet. Visit our menu to start your first order!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderHistoryItem key={order.id} order={order} />
        ))}
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={loading}
      />
    </div>
  );
};

export default OrderHistoryList;
