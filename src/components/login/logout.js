
export default function logout() {
    localStorage.removeItem('tokenKH');
    window.location = '/';
    return ""
}