var errordiv = document.querySelector("#errormessage")

if (location.href.includes("invalidemail")) {
    errordiv.innerHTML = "Invalid email address"
}
if (location.href.includes("usernametaken")) {
    errordiv.innerHTML = "Username already taken"
}
if (location.href.includes("passwordsdontmatch")) {
    errordiv.innerHTML = "Passwords don't match"
}
if (location.href.includes("passwordtoshort")) {
    errordiv.innerHTML = "Password to short, must be at least 3 letters"
}