// Function to convert the date format
export function convertDateFormat(inputDate) {
  const dateParts = inputDate.split('T')[0].split('-');
  const day = dateParts[2];
  const month = dateParts[1];
  const year = dateParts[0];
  return `${day}/${month}/${year}`;
}


// function to Get the current Date 
export function getCurrentDate() {
  const currentDate = new Date();
  
  // Get day, month, and year components
  const day = ('0' + currentDate.getUTCDate()).slice(-2);
  const month = ('0' + (currentDate.getUTCMonth() + 1)).slice(-2); // Months are zero-based
  const year = currentDate.getUTCFullYear();

  // Assemble the date in the desired format
  const formattedDate = `${day}/${month}/${year}`;

  return formattedDate;
}


