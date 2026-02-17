export const getShopId = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("current_shop_id");
    }
    return null;
};
