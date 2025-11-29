export const formatNumber = (value: string) => {
    if (!value) return "";
    return value
      .replace(/\D/g, "") // remove non-digits
      .replace(/\B(?=(\d{3})+(?!\d))/g, ","); // add commas
  };