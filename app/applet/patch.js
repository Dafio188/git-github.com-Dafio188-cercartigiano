const fs = require('fs');
let c = fs.readFileSync('src/components/dashboards/ClientDashboard.tsx', 'utf8');
c = c.replace(
  `} else {
                          setSelectedJob(job);
                          setIsProposalsModalOpen(true);
                        }`,
  `} else if (job.status === 'in_progress' && job.assignedWorkerId) {
                          const participants = [user.id, job.assignedWorkerId].sort();
                          setActiveChatConvId(\`job_\${job.id}_\${participants.join('_')}\`);
                        } else {
                          setSelectedJob(job);
                          setIsProposalsModalOpen(true);
                        }`
);

// We need to add the <ChatModal/> to the end of the return statement.
// Find the last "    </div>\n  );\n}"
const parts = c.split('    </div>\n  );\n}');
if (parts.length === 2) {
  c = parts[0] + '    </div>\n      {activeChatConvId && (\n        <ChatModal \n          user={user} \n          conversationId={activeChatConvId} \n          onClose={() => setActiveChatConvId(null)} \n        />\n      )}\n  );\n}';
} else {
  // Try another approach for insertion before the last );
  const lastReturnIdiom = '  );\n}';
  const idx = c.lastIndexOf(lastReturnIdiom);
  if (idx !== -1) {
    c = c.substring(0, idx) + '      {activeChatConvId && (\n        <ChatModal user={user} conversationId={activeChatConvId} onClose={() => setActiveChatConvId(null)} />\n      )}\n' + c.substring(idx);
  }
}

fs.writeFileSync('src/components/dashboards/ClientDashboard.tsx', c);
console.log('Patched');
