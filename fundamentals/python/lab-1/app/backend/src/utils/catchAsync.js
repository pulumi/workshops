/**
 * Taking the function and returning another function
 * to handle errors with async await
 */
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
