exports.formatExcelDate = (serialDate) => {
  const date = new Date(Math.round((serialDate - 25569) * 86400 * 1000));
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
    .format(date)
    .replace(/\//g, '-');
};
