export const nameRegex = /^[A-Za-z\s]{1,30}$/;
export const phoneRegex = /^\d{10,15}$/;
export const emailRegex = /^(?!.*[._-]{2})[a-zA-Z0-9_][a-zA-Z0-9.-_]*[a-zA-Z0-9]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,3}$/;

// password regex
export const length = /.{8,}/;
export const lowercase = /[a-z]/;
export const uppercase = /[A-Z]/;
export const number = /\d/;
export const specialChar = /[!@#$%&,.-]/;