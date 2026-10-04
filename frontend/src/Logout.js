import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {

    const navigate = useNavigate();

    useEffect(() => {

        localStorage.removeItem("token");

        navigate("/");

    }, [navigate]);

    return <h3>Logging out...</h3>;
}

export default Logout;