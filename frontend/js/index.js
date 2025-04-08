
// header and footer code
fetch('/nav/header.html')
    .then(response => {
        if (!response.ok) {
            throw new Error('Header file not found');
        }
        return response.text();
    })
    .then(data => {
        document.getElementById('header-placeholder').innerHTML = data;

        // login user
        const loginForm = document.getElementById("loginForm");
        if(loginForm){
            loginForm.addEventListener("submit", async function(event) {
                event.preventDefault();

                const email = document.getElementById("loginEmail").value
                const password = document.getElementById("loginPassword").value
                loginHandler(email, password)
            });
        }
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

document.addEventListener("DOMContentLoaded", function() {
    // creating user
    const registrationForm = document.getElementById("registrationForm");
    if(registrationForm){
        // taking all input values
        const nameInput = document.getElementById("username")
        const emailInput = document.getElementById("email")
        const passInput = document.getElementById("password")
        const confirmPassInput = document.getElementById("confirmPassword")

        registrationForm.addEventListener("submit", async function(event) {
            event.preventDefault();


            const name = nameInput.value;
            const email = emailInput.value;
            const password = passInput.value;
            const confirmPassword = confirmPassInput.value;


            if(password == confirmPassword){
                const response = await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
                });
                const data = await response.json()
                if(data?.status == 201){
                    nameInput.value=""
                    emailInput.value=""
                    passInput.value=""
                    confirmPassInput.value=""
                    alert(`${name}, your account created successfully`)
                } else if(data?.status == 400){
                    alert(data.message)
                }
            }else{
                alert("password didn't match")
            }
        });
    }
    
});

async function loginHandler(email, password) {
    if (!email || !password) {
        alert("Both email and password are required!");
        return;
    } else {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (data?.status === 200) {
            alert("Login successful!");
            window.location.href = "index.html"
        } else if (data?.status === 400) {
            alert(data.message);
        }
    }
}document.addEventListener("DOMContentLoaded", function () {
    const servicesContainer = document.getElementById("services-placeholder");
    if (servicesContainer) {
        servicesContainer.innerHTML = `
            <section id="foundation-services" style="padding: 2rem;">
                <h2>Our Charity Services</h2>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 250px; border: 1px solid #ccc; padding: 1rem; border-radius: 10px;">
                        <h3>💰 Money Charity</h3>
                        <p>Support those in need with financial donations. Every bit helps us reach more lives.</p>
                        <button onclick="donateNow('money')">Donate Now</button>
                    </div>
                    <div style="flex: 1; min-width: 250px; border: 1px solid #ccc; padding: 1rem; border-radius: 10px;">
                        <h3>👕 Clothes Charity</h3>
                        <p>Give your gently used clothes to those who need them most.</p>
                        <button onclick="donateNow('clothes')">Donate Clothes</button>
                    </div>
                    <div style="flex: 1; min-width: 250px; border: 1px solid #ccc; padding: 1rem; border-radius: 10px;">
                        <h3>🍲 Food Charity</h3>
                        <p>Help us provide meals to the hungry and support food drives in your area.</p>
                        <button onclick="donateNow('food')">Donate Food</button>
                    </div>
                </div>
            </section>
        `;
    }
});

function donateNow(type) {
    alert(`Thank you for choosing to donate: ${type.charAt(0).toUpperCase() + type.slice(1)}!`);
    // Later you can redirect or open a donation form
    // window.location.href = `/donate/${type}.html`;
}
