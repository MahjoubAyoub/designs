export const loggingMiddleware = (req, res, next) => {
  console.log('--- Request Details ---');
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  console.log('Params:', req.params);
  console.log('---------------------');
  next(); 
};