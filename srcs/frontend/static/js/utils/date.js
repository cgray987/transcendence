// Helper function to format the date
export const formatDate = (dateString) => {
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');

	// Return the formatted date as 'YYYY-MM-DD HH:mm'
	return `${year}-${month}-${day} ${hours}:${minutes}`;
}
// Helper function to format the seconds
// Ex: 3600 seconds -> 01:00:00
export const formatSeconds = (seconds) => {
	const date = new Date(null);
	date.setSeconds(seconds);
	return date.toISOString().substr(11, 8);
}
