fetch('/nav/header.html')
    .then(response => {
        if (!response.ok) {
            throw new Error('Header file not found');
        }
        return response.text();
    })
    .then(data => {
        document.getElementById('header-placeholder').innerHTML = data;
    })
    .catch(error => {
        console.error('Error loading header:', error);
    });

fetch('/nav/footer.html')
    .then(response => {
        if (!response.ok) {
            throw new Error('Footer file not found');
        }
        return response.text();
    })
    .then(data => {
        document.getElementById('footer-placeholder').innerHTML = data;
    })
    .catch(error => {
        console.error('Error loading footer:', error);
    });

