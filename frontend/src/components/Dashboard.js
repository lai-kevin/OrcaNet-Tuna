import { LineChart, BarChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar } from 'recharts';
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { Mode } from './Mode';
import { useContext } from 'react';
const Dashboard=()=>{
    const {mode} = useContext(Mode)
    return(
    <div className= "homepage">
      <div id="connection"> 
        <IoCheckmarkCircleOutline color="green" size="24"/>
        <span id= "connect_text" style={{ color: mode === "dark" ? "white" : "black" }}>Connected to OrcaNet </span>
        <span id = "app_version" style={{ color: mode === "dark" ? "white" : "black" }}>Application Version: 1.0</span>
      </div>
      <div className="dashboard">
        <Box stat="300 GB" info = "Files" c="#ADD8E6" mode = {mode}/>
        <Box stat="200" info="Peer Connections" c="#1E90FF" mode = {mode}/>
        <Box stat="200" info="Daily Files Uploads" c="#8884d8" mode={mode}/>
        <Box stat="400" info="Daily Files Downloads" c="#ADD8E6" mode={mode}/>
        <LineGraph mode={mode}/>
        <BarGraph  mode={mode}/>
      </div>
      <div id="blank"></div>
    </div>
    )
}
const Box = ({stat, info, c, mode}) => {
    return (
      <div className={`${mode === 'dark' ? 'box-dark' : 'box-light'}`}>
        <h3 className="stat" style={{color:c}} >{stat}</h3>
        <p className="info">{info}</p>
      </div>
    );
};

const LineGraph = ({mode}) => {
    const data = [
        { month: 'Jan', users: 500 },
        { month: 'Feb', users: 405 },
        { month: 'Mar', users: 400 },
        { month: 'Apr', users: 378 },
        { month: 'May', users: 589 },
        { month: 'June', users: 300 },
        { month: 'July', users: 550 }
      ];
    return (
    <div className={`${mode === 'dark' ? 'line_graph_container-dark' : 'line_graph_container-light'}`}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="month" tick={{ fill: mode === 'dark' ? 'white' : 'black' }} axisLine={{ stroke: mode === 'dark' ? 'white' : 'black' }} tickLine={{ stroke: mode === 'dark' ? 'white' : 'black' }}/>
          <YAxis tick={{ fill: mode === 'dark' ? 'white' : 'black' }} axisLine={{ stroke: mode === 'dark' ? 'white' : 'black' }} tickLine={{ stroke: mode === 'dark' ? 'white' : 'black' }}/>
          <Line dataKey="users" stroke="#8884d8" />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    <div className ="description">
        <h4 className='graph_caption'> Application Traffic </h4>
    </div>
    </div>
    );
  };
  const BarGraph = ({mode}) => {
    const data = [
        { month: 'Jan', transaction: 1000 },
        { month: 'Feb', transaction: 805 },
        { month: 'Mar', transaction: 935 },
        { month: 'Apr', transaction: 678 },
        { month: 'May', transaction: 789 },
        { month: 'June', transaction: 320 },
        { month: 'July', transaction: 750 }
      ];
    return (
    <div className={`${mode === 'dark' ? 'bar_graph_container-dark' : 'bar_graph_container-light'}`}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="month" tick={{ fill: mode === 'dark' ? 'white' : 'black' }} axisLine={{ stroke: mode === 'dark' ? 'white' : 'black' }} tickLine={{ stroke: mode === 'dark' ? 'white' : 'black' }}/>
          <YAxis tick={{ fill: mode === 'dark' ? 'white' : 'black' }} axisLine={{ stroke: mode === 'dark' ? 'white' : 'black' }} tickLine={{ stroke: mode === 'dark' ? 'white' : 'black' }}/>
          <Bar dataKey="transaction" fill="#87CEEB"/>
          <Tooltip />
        </BarChart>
      </ResponsiveContainer>
    <div className ="description">
        <h4 className='graph_caption'> Oracoin Transactions </h4>
    </div>
    </div>
    );
  };
export default Dashboard