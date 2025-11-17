const helmet = require('helmet');

module.exports = function security() {
  const isDev = process.env.NODE_ENV === 'development';

  const scriptSrc = ["'self'"];
  const styleSrc = ["'self'"];
  const imgSrc = ["'self'", "data:"];
  const connectSrc = ["'self'"];

  if (isDev) {
    scriptSrc.push("'unsafe-inline'");
    styleSrc.push("'unsafe-inline'");
  }

  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc,
        styleSrc,
        imgSrc,
        connectSrc,
        objectSrc: ["'none'"],
      },
    },
    referrerPolicy: { policy: "no-referrer" },
  });
};
