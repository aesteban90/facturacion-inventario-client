import { useState } from 'react';

export default function useToken() {  

  const getToken = () => {
    const tokenString = localStorage.getItem('tokenKH');
    const userToken = JSON.parse(tokenString);    
    return userToken?.token
  };
  
  const getUsername = () => {
    const tokenString = localStorage.getItem('tokenKH');
    const userName = JSON.parse(tokenString);        
    return userName?.username
  };

  const saveToken = userToken => {
    localStorage.setItem('tokenKH', JSON.stringify(userToken));
    setToken(userToken.token);
  };

  const [token, setToken] = useState(getToken());

  return {
    setToken: saveToken, token, getUsername, 
  }

  
}

