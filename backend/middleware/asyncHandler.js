/**
 * Yeh function async controller functions ko wrap karta hai.
 * Isse humein har function mein try-catch block likhne ki zaroorat nahi padti.
 * Agar async function mein koi error aata hai, to yeh use automatically 'next()' function ko pass kar deta hai,
 * jisse hamara global error handler use handle kar leta hai.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;