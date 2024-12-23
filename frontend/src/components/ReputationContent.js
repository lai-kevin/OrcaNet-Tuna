import React from 'react';

const ReputationSystem = () => {
  // Hardcoded metadata for the reputation system
  const reputationData = [
    { fileName: "example1.pdf", downloads: 10, upvotes: 8 },
    { fileName: "example2.jpg", downloads: 15, upvotes: 12 },
    { fileName: "example3.docx", downloads: 7, upvotes: 5 },
    { fileName: "example4.png", downloads: 20, upvotes: 18 },
  ];

  // Calculate total reputation (sum of upvotes)
  const totalReputation = reputationData.reduce((total, file) => total + file.upvotes, 0);

  return (
    <div className="reputation-system">
      {/* Total Reputation */}
      <div style={{ fontSize: "18px", marginBottom: "20px" }}>
        <span style={{ fontStyle: "italic" }}>Reputation:</span>{" "}
        <span style={{ fontWeight: "bold", fontSize: "20px" }}>{totalReputation}</span>{" "}
        
      </div>

      {/* Table for reputation data */}
      <h2>Reputation System</h2>
      <table>
        <thead>
          <tr>
            <th>File Name</th>
            <th>Downloads</th>
            <th>Upvotes</th>
          </tr>
        </thead>
        <tbody>
          {reputationData.map((file, index) => (
            <tr key={index}>
              <td>{file.fileName}</td>
              <td>{file.downloads}</td>
              <td>{file.upvotes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


export default ReputationSystem;
