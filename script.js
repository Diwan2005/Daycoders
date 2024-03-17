document.addEventListener('DOMContentLoaded', function() {
    const upgradeButtons = document.querySelectorAll('.upgrade-btn');
    
    upgradeButtons.forEach(function(button) {
      button.addEventListener('click', async function() {
        try {
          // Check if Metamask is installed
          if (typeof window.ethereum !== 'undefined') {
            // Request account access if needed
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Now you can interact with Metamask
            // Here, you can add logic to initiate the payment process
            
            // Once payment is successful, redirect to image.html
            window.location.href = 'image.html';
          } else {
            // Metamask is not installed or not available
            alert('Metamask is not installed. Please install it to proceed with the payment.');
          }
        } catch (error) {
          console.error('Error connecting to Metamask:', error);
          // Handle errors here
        }
      });
    });
  });
  