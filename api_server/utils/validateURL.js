const validateURL = function (link) {
  const re = /^(https?|HTTPS?):\/\/(www.|WWW.)?((([a-zA-Z0-9-]{1,63}\.){1,256}[a-zA-Z]{2,6})|((\d{1,3}\.){3}\d{1,3}))(:\d{2,5})?([-a-zA-Z0-9_\/.]{0,256}#?)?$/;
  return re.test(link);
};

module.exports = validateURL;
