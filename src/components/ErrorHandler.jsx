import React, { useEffect } from 'react'
import { useLocation } from "react-router"

export const ErrorHandler = ({ setErrors }) => {
    const location = useLocation();

    useEffect(() => {
        setErrors([]);
    }, [location.pathname, setErrors]);

  return null;
}
