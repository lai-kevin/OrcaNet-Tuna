import { Outlet, NavLink } from "react-router-dom";
import NavBar from "./NavBar";
import SearchBar from "./SearchBar";
import { DropMenu } from "./SearchBar";
const MainPage = ({user, setUser})=> {
    return (
        <div className="base">
        <NavBar />  
        <div className="content">
          <SearchBar user={user} setUser = {setUser}/>
          <main className="main_content">
            <Outlet user={user}/>  
          </main>
        </div>
      </div>
    )
}
export default MainPage;