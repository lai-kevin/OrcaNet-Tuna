// Import axios
import axios from 'axios';

// Function to fetch data from the Go backend
export const fetchData = async () => {
  console.log("Fetching data from the backend..."); // Debug log

  try {
    // Send GET request to the Go backend
    const response = await axios.get('http://localhost:8080/');
    
    // Log the response from the Go backend
    console.log('Response from Go server:', response.data);
  } catch (error) {
    console.error('Error fetching data from Go server:', error);
  }
};

// Call the function to fetch data
fetchData();
