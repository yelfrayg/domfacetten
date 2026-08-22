document.addEventListener('DOMContentLoaded', () => {
    const adminAuthForm = document.getElementById('admin-auth');

    adminAuthForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const codeInput = document.getElementById('access-code').value;

        console.log({
            code: codeInput
        })

        try {
            const response = await fetch('/api/adminManagement/verifyCode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code: codeInput })
            });
            const res = await response.json();
            if(res.status === 'SUCCESS') {
                localStorage.setItem('adminJWTCode', res.data.reqData);
                window.location.href = '/editProducts';
            }
            console.log('Admin authentication response:', res);
        } catch (error) {
            console.error('Error during admin authentication:', error);
        }
    })
    
})