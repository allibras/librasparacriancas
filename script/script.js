const form = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const usernameError = document.getElementById('usernameError');
const passwordError = document.getElementById('passwordError');

function validateUsername(){
    const username = usernameInput.value.trim();

    if (username === ''){
        showError(usernameInput, usernameError, 'O nome de usuário é obrigatório');
        return false;
    }

    if (username.length < 3){
        showError(usernameInput, usernameError, 'O nome de usuário deve ter no mínimo 3 caracteres');
        return false;
    }

    if (username.length > 20){
        showError(usernameInput, usernameError, 'O nome de usuário deve ter no máximo 20 caracteres');
        return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)){
        showError(usernameInput, usernameError, 'Use apenas letras e números');
        return false;
    }

    showSuccess(usernameInput, usernameError);
    return true;
}

function validatePassword(){
    const password = passwordInput.value;

    if(password ===''){
        showError(passwordInput, passwordError, 'A senha é obrigatória');
        return false;
    }

    if(password.length < 6){
        showError(passwordInput, passwordError, 'A senha deve ter no mínimo 6 caracteres');
        return false;
    }

    showSuccess(passwordInput, passwordError);
    return true;
}

function showError(input, errorElement, message){
    input.classList.add('invalid');
    input.classList.remove('valid');
    errorElement.textContent = message;
}

function showSuccess(input, errorElement){
    input.classList.remove('invalid');
    input.classList.add('valid');
    errorElement.textContent = '';
}

usernameInput.addEventListener('blur', validateUsername);
passwordInput.addEventListener('blur', validatePassword);

usernameInput.addEventListener('input', () => {
    if (usernameInput.value.trim() !== ''){
        validateUsername();
    }
})

passwordInput.addEventListener('input', () => {
    if (passwordInput.value !== ''){
        validatePassword();
    }
})

form.addEventListener('submit', function(e){
    e.preventDefault();

    const isUsernameValid = validateUsername();
    const isPasswordValid = validatePassword();

    if (isUsernameValid && isPasswordValid){
        alert('Login realizado com sucesso!');
        console.log('Usuário:', usernameInput.value);
        console.log('Senha:', passwordInput.value);
    } else{
        alert('Por favor, corrija os erros antes de continuar');
    }
});