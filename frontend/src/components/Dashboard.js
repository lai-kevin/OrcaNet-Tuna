import { LineChart, BarChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar } from 'recharts';
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { Mode } from './Mode';
import { useContext } from 'react';
const Dashboard=()=>{
    const {mode} = useContext(Mode)
    let userhash1 = "9738a15ccc6cbc6c84e2617ad445944f2aa126dd7363ce8e9b5da6567b15e44d"
    let userhash2 = "707d683a8bae94497ff89ef9c55d2eef9607b58a6831cecc34f83ff340dd81c9"
    let userhash3 =  "b01ad20e4de4055c2b4f6d11a424bf940aaa309a85d27a749e1c8d8d53f4ac39"
    let userhash4 =  "e15b9c444a533a11cc3562d57454f079577d4ab804ddf3550520209d5f6bee3f"
    let userhash5 = "e2430b344783b96f397102992add6b7a77506243e85ce3c008e55e130cc8a3f2"
    let userhash6 = "45c3e83c84f24c215bd9e59c56537f1371a2d1dd0e44afcfd219587a284cdb45"

    const LeaderBoard = [
      {rank: 1, id: userhash1, downloadcount: 100, proxycount: 100, upvotes: 30},
      {rank: 2, id: userhash2, downloadcount: 50, proxycount: 90, upvotes: 20},
      {rank: 3, id: userhash3, downloadcount: 50, proxycount: 80, upvotes: 20},
      {rank: 4, id: userhash4, downloadcount: 25, proxycount: 80, upvotes: 10},
      {rank: 5, id: userhash5, downloadcount: 10, proxycount: 10, upvotes: 5},
      {rank: 6, id: userhash6, downloadcount: 1, proxycount: 1, upvotes: 1}
    ];


    return(
    <div className= "homepage">
      <div id="connection"> 
        <IoCheckmarkCircleOutline color="green" size="24"/>
        <span id= "connect_text" style={{ color: mode === "dark" ? "white" : "black" }}>Connected to OrcaNet </span>
        <span id = "app_version" style={{ color: mode === "dark" ? "white" : "black" }}>Application Version: 1.0</span>
      </div>
      <div className ="provider-table-container">
      <h3 id="request_title">Peer Node Reputation Leaderboard</h3>
          <table id="providers_table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Peer ID</th>
                <th>Downloads Fullfilled</th>
                <th>Proxy Requests Fullfilled</th>
                <th>Upvotes</th>
              </tr>

            </thead>
            <tbody>
              {LeaderBoard.map((peer) => (
                <tr
                    key={peer.id}
                >
                    <td>{peer.rank}</td>
                    <td>{peer.id}</td>
                    <td>{peer.downloadcount}</td>
                    <td>{peer.proxycount}</td>
                    <td>{peer.upvotes}</td>
                </tr>
            ))}
            </tbody>
          </table>
      </div>
      <br/>
      <div className="dashboard">
        <Box stat="300 GB" info = "Files" c="#ADD8E6" mode = {mode}/>
        <Box stat="200" info="Peer Connections" c="#1E90FF" mode = {mode}/>
        {/* <Box stat="200" info="Daily Files Uploads" c="#8884d8" mode={mode}/>
        <Box stat="400" info="Daily Files Downloads" c="#ADD8E6" mode={mode}/> */}
        {/* <LineGraph mode={mode}/>
        <BarGraph  mode={mode}/> */}
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