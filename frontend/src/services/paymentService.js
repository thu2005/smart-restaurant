import api from "./api";

const paymentService = {
  createPayment: async ({ orderId, restaurantId, amount, method, tip, tax }) => {
    return api.post("/payments", {
      orderId,
      restaurantId,
      amount,
      method,
      tip: tip || 0,
      tax: tax || 0
    });
  }
};

export default paymentService;
