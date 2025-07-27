import { useContext } from "react"
import UserContext from "../../context/UserContext"

export const HomePage = () => {
  const { user } = useContext(UserContext);
  return (
    <div>Hello { user.name || user.email }</div>
  )
}
