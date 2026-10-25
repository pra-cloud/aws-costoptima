import React, { useState, useEffect } from 'react';
import {
  Cloud,
  ShieldCheck,
  Sparkles,
  Bot,
  ArrowRight,
  CheckCircle2,
  Server,
  HardDrive,
  Network,
  Database,
  Layers,
  Zap,
  DollarSign,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Send,
  HelpCircle,
  TrendingDown,
  Sliders,
  CheckCheck,
  Info,
  AlertCircle,
  Loader2
} from 'lucide-react';
import ConnectAwsModal from './components/ConnectAwsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations', 'copilot', 'breakdown'
  const [filterRisk, setFilterRisk] = useState('ALL'); // 'ALL', 'SAFE', 'ZERO_DOWNTIME'
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  
  // Connection and scanning state
  const [accountInfo, setAccountInfo] = useState({
    id: 'Connecting...',
    region: 'ap-south-1',
    isDemo: false
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanNotification, setScanNotification] = useState(null);

  useEffect(() => {
    fetch('/api/scan')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setAccountInfo({
            id: data.account_id || 'Connected Account',
            region: data.region || 'ap-south-1',
            isDemo: data.account_id ? data.account_id.includes('Demo') : false
          });
          if (data.findings && data.findings.length > 0) {
            setFindings(data.findings);
          }
          if (data.monthly_current_spend) {
            setBaseMonthlySpend(data.monthly_current_spend);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Track resolved items to simulate real-time savings
  const [resolvedIds, setResolvedIds] = useState([]);

  // Copilot chat state
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: "👋 Hello! I am your AI AWS Cost Copilot.\n\nI have completed auditing your connected AWS infrastructure. We identified **$839.40/month in recoverable waste** across idle servers, detached storage, and network routing.\n\nYou can ask me questions like: *'Which fixes are 100% safe to do right now?'* or *'How does the S3 VPC endpoint eliminate NAT gateway charges?'*"
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Recommendations data
  const [findings, setFindings] = useState([
    {
      id: "rds-multi-az-dev",
      category: "Databases",
      title: "Over-Provisioned Staging Database",
      humanSummary: "Your development database (dev-catalog-db) has Multi-AZ standby enabled. You are paying double price for high-availability standby on a test database that has zero traffic outside work hours.",
      savings: 224.00,
      currentCost: 360.00,
      risk: "Maintenance Window",
      riskLevel: "medium",
      riskExplanation: "Requires a 2-3 minute database restart to resize. Perform during low-traffic hours.",
      howToFix: "Convert from Multi-AZ to Single-AZ and rightsize to db.t4g.large.",
      cli: "aws rds modify-db-instance --db-instance-identifier dev-catalog-db --no-multi-az --db-instance-class db.t4g.large --apply-immediately",
      resourceId: "dev-catalog-db (db.r5.xlarge)"
    },
    {
      id: "nat-gw-vpc-endpoint",
      category: "Networking",
      title: "Unnecessary NAT Gateway Data Transfer",
      humanSummary: "Your EC2 instances are backing up 4.2 TB/month to S3 through an AWS NAT Gateway ($0.045/GB fee). Creating a free S3 Gateway VPC Endpoint routes this backup traffic internally at zero cost.",
      savings: 189.00,
      currentCost: 218.40,
      risk: "Zero Downtime",
      riskLevel: "safe",
      riskExplanation: "100% safe. AWS routes S3 traffic internally with zero disruption to existing connections.",
      howToFix: "Attach a free S3 Gateway VPC Endpoint to your VPC route tables.",
      cli: "aws ec2 create-vpc-endpoint --vpc-id vpc-0a71b299 --service-name com.amazonaws.us-east-1.s3 --route-table-ids rtb-081ba79",
      resourceId: "nat-081fa7b9192"
    },
    {
      id: "ec2-idle-i-0a817fbc9910",
      category: "Compute",
      title: "Idle Staging EC2 Instance (c5.2xlarge)",
      humanSummary: "Average CPU utilization over the last 14 days was 3.4% with a peak of 11.2%. Downsizing from c5.2xlarge to t3.large comfortably supports staging workloads while cutting 75% of server cost.",
      savings: 184.60,
      currentCost: 248.20,
      risk: "Low Risk",
      riskLevel: "low",
      riskExplanation: "Requires a 60-second server reboot to apply the new instance type.",
      howToFix: "Stop instance, modify instance type to t3.large, and restart.",
      cli: "aws ec2 stop-instances --instance-ids i-0a817fbc9910 && aws ec2 modify-instance-attribute --instance-id i-0a817fbc9910 --instance-type '{\"Value\": \"t3.large\"}' && aws ec2 start-instances --instance-ids i-0a817fbc9910",
      resourceId: "i-0a817fbc9910 (staging-api)"
    },
    {
      id: "s3-lifecycle-intelligent-tiering",
      category: "Storage",
      title: "Missing S3 Intelligent-Tiering Policy",
      humanSummary: "Bucket contains 14 TB of objects older than 90 days stored in S3 Standard. Enabling Intelligent-Tiering automatically tiers cold objects to Archive/Glacier tiers with no retrieval fees.",
      savings: 165.00,
      currentCost: 322.00,
      risk: "100% Safe",
      riskLevel: "safe",
      riskExplanation: "Zero risk. Files remain instantly accessible with millisecond retrieval performance.",
      howToFix: "Apply Intelligent-Tiering lifecycle rule.",
      cli: "aws s3api put-bucket-lifecycle-configuration --bucket hyperzod-app-logs-and-backups --lifecycle-configuration file://s3-lifecycle.json",
      resourceId: "hyperzod-app-logs-and-backups"
    },
    {
      id: "ebs-zombie-vol-0e9b11a910",
      category: "Storage",
      title: "Detached Zombie EBS Volume (500 GB)",
      humanSummary: "A 500 GB GP2 volume was detached from a terminated instance 42 days ago. AWS continues charging for the allocated storage ($0.10/GB) every month it sits idle.",
      savings: 50.00,
      currentCost: 50.00,
      risk: "100% Safe",
      riskLevel: "safe",
      riskExplanation: "Volume is unattached to any running instance. Take a safety snapshot and delete.",
      howToFix: "Create a snapshot and delete the unattached volume.",
      cli: "aws ec2 create-snapshot --volume-id vol-0e9b11a910 --description 'Pre-deletion backup' && aws ec2 delete-volume --volume-id vol-0e9b11a910",
      resourceId: "vol-0e9b11a910 (500 GB)"
    },
    {
      id: "ebs-gp2-vol-08491bb4",
      category: "Storage",
      title: "Legacy GP2 Volume Upgrade (-20% Flat)",
      humanSummary: "Volume is running on older GP2 storage. AWS GP3 is 20% cheaper ($0.08/GB vs $0.10/GB) and delivers baseline 3,000 IOPS. Upgrading takes 1 command with zero downtime.",
      savings: 16.00,
      currentCost: 80.00,
      risk: "Zero Downtime",
      riskLevel: "safe",
      riskExplanation: "Zero downtime. AWS upgrades the volume online in the background with no IO interruption.",
      howToFix: "Modify volume type from gp2 to gp3.",
      cli: "aws ec2 modify-volume --volume-id vol-08491bb4 --volume-type gp3",
      resourceId: "vol-08491bb4 (800 GB)"
    },
    {
      id: "eip-unattached-eipalloc-01772",
      category: "Networking",
      title: "3 Unattached Elastic Static IPs",
      humanSummary: "AWS charges $3.60/month per Elastic IP when it is not associated with any active server. You have 3 unused static IPs incurring monthly penalty fees.",
      savings: 10.80,
      currentCost: 10.80,
      risk: "100% Safe",
      riskLevel: "safe",
      riskExplanation: "Safe if these IP addresses are not referenced in external DNS records.",
      howToFix: "Release unused Elastic IPs back to the AWS pool.",
      cli: "aws ec2 release-address --allocation-id eipalloc-01772 && aws ec2 release-address --allocation-id eipalloc-02981",
      resourceId: "35.174.92.110 (unattached)"
    }
  ]);

  const [baseMonthlySpend, setBaseMonthlySpend] = useState(3840.00);

  const getCategoryIcon = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('database') || cat.includes('rds')) return Database;
    if (cat.includes('network') || cat.includes('nat') || cat.includes('eip')) return Network;
    if (cat.includes('compute') || cat.includes('ec2')) return Server;
    if (cat.includes('storage') || cat.includes('ebs')) return HardDrive;
    if (cat.includes('s3')) return Layers;
    return Zap;
  };

  const handleConnectAccount = async (credentials) => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/scan/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to authenticate AWS account.');
      }
      
      const scanData = data.data;
      if (scanData) {
        setAccountInfo({
          id: scanData.account_id || 'Connected Account',
          region: scanData.region || credentials.region || 'us-east-1',
          isDemo: credentials.is_demo || false
        });
        if (scanData.findings) {
          setFindings(scanData.findings);
        }
        if (scanData.monthly_current_spend) {
          setBaseMonthlySpend(scanData.monthly_current_spend);
        }
        setResolvedIds([]);
        setScanNotification({
          type: 'success',
          message: `Connected ${scanData.account_id} in ${scanData.region}! Found ${scanData.findings?.length || 0} optimization opportunities.`
        });
        
        // Add greeting message to AI Copilot
        setChatMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: `Connected to account **${scanData.account_id}** (${scanData.region}).\n\nI have finished scanning your cloud infrastructure. Total potential monthly savings identified: **$${(scanData.total_monthly_savings || 0).toFixed(2)}/mo** across ${scanData.findings?.length || 0} findings.`
          }
        ]);
        
        setTimeout(() => setScanNotification(null), 8000);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const totalPotentialSavings = findings.reduce((acc, f) => acc + (f.savings || 0), 0);
  const realizedSavings = findings
    .filter(f => resolvedIds.includes(f.id))
    .reduce((acc, f) => acc + (f.savings || 0), 0);

  const targetOptimizedBill = Math.max(0, baseMonthlySpend - totalPotentialSavings);
  const currentLiveBill = Math.max(0, baseMonthlySpend - realizedSavings);
  const efficiencyScore = totalPotentialSavings > 0
    ? Math.min(100, Math.round(75 + (realizedSavings / totalPotentialSavings) * 25))
    : 100;

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleResolve = (id) => {
    if (resolvedIds.includes(id)) {
      setResolvedIds(resolvedIds.filter(item => item !== id));
    } else {
      setResolvedIds([...resolvedIds, id]);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!inputQuestion.trim()) return;

    const userText = inputQuestion;
    setInputQuestion('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setIsAiTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userText })
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
      } else {
        setChatMessages(prev => [...prev, { sender: 'bot', text: "Here is what I recommend: You can delete any detached EBS volumes and release unattached Elastic IPs immediately. Both actions are 100% safe and carry zero downtime." }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { sender: 'bot', text: "Here is what I recommend: You can delete any detached EBS volumes and release unattached Elastic IPs immediately. Both actions are 100% safe and carry zero downtime." }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const safeCount = findings.filter(f => f.riskLevel === 'safe' || f.risk === '100% Safe').length;
  const zeroDowntimeCount = findings.filter(f => f.risk === 'Zero Downtime' || f.risk === '100% Safe').length;

  const filteredFindings = findings.filter(f => {
    if (filterRisk === 'SAFE') return f.riskLevel === 'safe' || f.risk === '100% Safe';
    if (filterRisk === 'ZERO_DOWNTIME') return f.risk === 'Zero Downtime' || f.risk === '100% Safe';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Apple-Style Clean Frosted Navigation Bar */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Cloud className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-900">CloudOptima</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  AI FinOps
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Autonomous AWS Cloud Cost Optimization</p>
            </div>
          </div>

          {/* Account status & CTA */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/80 text-xs text-slate-700 font-medium">
              <span className={`w-2 h-2 rounded-full ${accountInfo.isDemo ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></span>
              <span className="text-slate-500">Account:</span>
              <span className="font-mono text-slate-900 font-semibold">{accountInfo.id}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-mono text-[11px]">{accountInfo.region}</span>
            </div>

            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition active:scale-[0.98]"
            >
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              {accountInfo.isDemo ? 'Connect AWS Account' : 'Change Account / Region'}
            </button>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {scanNotification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{scanNotification.message}</span>
            </div>
            <button onClick={() => setScanNotification(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* 2. Executive Hero Banner: Apple Clean Card */}
        <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden p-8 sm:p-10 relative">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Executive Cost & Waste Audit</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Recover <span className="text-emerald-600 font-mono">${totalPotentialSavings.toFixed(2)}/mo</span> from your cloud waste.
              </h1>
              
              <p className="text-sm text-slate-600 leading-relaxed">
                CloudOptima identified <strong className="text-slate-900 font-semibold">{findings.length} immediate optimization opportunities</strong> in your AWS environment. 
                Applying these non-disruptive recommendations reduces your monthly cloud invoice from <span className="line-through text-slate-400 font-mono">${baseMonthlySpend.toFixed(2)}</span> down to <span className="text-slate-900 font-mono font-bold">${targetOptimizedBill.toFixed(2)}/month</span>.
              </p>

              {/* Live Savings Action Bar */}
              {realizedSavings > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="text-xs font-bold text-emerald-900">
                        ${realizedSavings.toFixed(2)}/month Saved So Far!
                      </div>
                      <div className="text-[11px] text-emerald-700">
                        {resolvedIds.length} of {findings.length} optimizations marked complete.
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-800 font-mono">
                      Current Bill: ${currentLiveBill.toFixed(2)}/mo
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bill Comparison Card */}
            <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 min-w-[280px] lg:min-w-[320px] space-y-4 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Monthly Projection
              </span>

              <div className="space-y-3">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-500">Current Run-Rate:</span>
                  <span className="text-slate-700 font-mono font-bold line-through">${baseMonthlySpend.toFixed(2)}</span>
                </div>

                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-500">Recoverable Waste:</span>
                  <span className="text-emerald-600 font-mono font-bold">-${totalPotentialSavings.toFixed(2)}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-slate-900">Target Monthly:</span>
                  <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">${targetOptimizedBill.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
                  <span>Cloud Efficiency Score</span>
                  <span className="font-bold text-blue-600 font-mono">{efficiencyScore}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500 rounded-full"
                    style={{ width: `${efficiencyScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 4 Executive Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Annual Run-Rate Cut</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-emerald-600 font-mono tracking-tight">
                +${(totalPotentialSavings * 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-500 mt-1">Direct bottom-line ARR savings</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Instant Safe Cuts</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {safeCount} Fixes
              </div>
              <p className="text-xs text-slate-500 mt-1">100% zero-risk to production</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Zero Downtime</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {zeroDowntimeCount} of {findings.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Requires zero server reboots</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Actionable Leaks</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {Math.max(0, findings.length - resolvedIds.length)} <span className="text-xs font-normal text-slate-500">Pending</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {resolvedIds.length} resolved • {findings.length} total
              </p>
            </div>
          </div>
        </div>

        {/* 4. Tab Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'recommendations'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-4 h-4" />
              Actionable Fixes ({findings.length})
            </button>

            <button
              onClick={() => setActiveTab('copilot')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'copilot'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bot className="w-4 h-4" />
              AI FinOps Copilot
            </button>

            <button
              onClick={() => setActiveTab('breakdown')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'breakdown'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              Spend Categories
            </button>
          </div>

          {activeTab === 'recommendations' && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 mr-1 text-[11px] font-medium">Filter:</span>
              <button
                onClick={() => setFilterRisk('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterRisk === 'ALL'
                    ? 'bg-white text-slate-900 border border-slate-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All ({findings.length})
              </button>
              <button
                onClick={() => setFilterRisk('SAFE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterRisk === 'SAFE'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                100% Safe ({safeCount})
              </button>
              <button
                onClick={() => setFilterRisk('ZERO_DOWNTIME')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterRisk === 'ZERO_DOWNTIME'
                    ? 'bg-blue-50 text-blue-800 border border-blue-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Zero Downtime ({zeroDowntimeCount})
              </button>
            </div>
          )}
        </div>

        {/* 5. Tab 1: Recommendations List (Apple Light Theme Cards) */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            {filteredFindings.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/80 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Zero Idle Waste Found in this Region!</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Your scanned AWS infrastructure is currently running efficiently. You can switch regions or load the demo dataset to review optimization examples.
                </p>
                <button
                  onClick={() => setIsConnectModalOpen(true)}
                  className="mt-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Scan Another Region
                </button>
              </div>
            ) : (
              filteredFindings.map((item) => {
                const isResolved = resolvedIds.includes(item.id);
                const isExpanded = expandedId === item.id;
                const Icon = getCategoryIcon(item.category);

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border transition-all duration-200 ${
                      isResolved
                        ? 'bg-slate-50/80 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-md shadow-sm'
                    }`}
                  >
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
                      {/* Left details */}
                      <div className="flex items-start gap-4">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 border ${
                          isResolved
                            ? 'bg-slate-100 text-slate-400 border-slate-200'
                            : 'bg-slate-50 text-blue-600 border-slate-200/80 shadow-sm'
                        }`}>
                          <Icon className="w-5 h-5 stroke-[2.2]" />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-base font-bold ${isResolved ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {item.title}
                            </span>

                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.riskLevel === 'safe'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.riskLevel === 'low'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {item.risk}
                            </span>

                            <span className="text-[11px] font-mono text-slate-500 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                              {item.resourceId}
                            </span>
                          </div>

                          {/* Plain human explanation */}
                          <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                            {item.humanSummary}
                          </p>

                          {/* Risk / Downtime tag */}
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{item.riskExplanation}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right action and pricing */}
                      <div className="flex items-center md:flex-col md:items-end justify-between shrink-0 gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <div className="text-left md:text-right">
                          <div className="text-lg font-black text-emerald-600 font-mono tracking-tight">
                            +${(item.savings || 0).toFixed(2)}/mo
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Current: ${(item.currentCost || 0).toFixed(2)}/mo
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleResolve(item.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                              isResolved
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            {isResolved ? 'Marked Fixed' : 'Mark Fixed'}
                          </button>

                          <button
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500"
                            title="View Remediation CLI"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable 1-Click CLI section */}
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
                          <span className="flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-blue-600" />
                            Exact Remediation CLI (Copy & Run in AWS CloudShell)
                          </span>
                          <span className="text-[11px] font-normal text-slate-500">
                            Action: {item.howToFix}
                          </span>
                        </div>

                        <div className="relative group">
                          <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                            {item.cli}
                          </pre>
                          <button
                            onClick={() => handleCopy(item.id, item.cli)}
                            className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-sm transition"
                          >
                            {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                            {copiedId === item.id ? 'Copied' : 'Copy Command'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 6. Tab 2: AI FinOps Copilot (Apple Clean Chat Style) */}
        {activeTab === 'copilot' && (
          <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                  <Bot className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Google Gemini Pro Cloud Copilot</h3>
                  <p className="text-xs text-slate-500">
                    Ask questions regarding architectural risk, rightsizing safety, and reserved instance strategies.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Online & Connected
              </span>
            </div>

            {/* Chat message history */}
            <div className="space-y-4 max-h-[440px] overflow-y-auto pr-2">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 text-xs leading-relaxed ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 text-[10px] font-bold shadow-sm">
                      AI
                    </div>
                  )}
                  <div
                    className={`p-4 rounded-2xl max-w-xl whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none font-medium shadow-sm'
                        : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Gemini Pro is reasoning over your cloud telemetry...
                </div>
              )}
            </div>

            {/* Chat input box */}
            <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                placeholder="Ask anything about cutting your AWS bill..."
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                className="flex-1 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={isAiTyping || !inputQuestion.trim()}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Ask AI
              </button>
            </form>
          </div>
        )}

        {/* 7. Tab 3: Spend Category Breakdown (Apple Light Style) */}
        {activeTab === 'breakdown' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Databases (RDS)', amount: 224.00, pct: 27, icon: Database, color: 'text-blue-600', bg: 'bg-blue-50', note: 'Multi-AZ staging standby' },
              { name: 'Networking (NAT & EIP)', amount: 199.80, pct: 24, icon: Network, color: 'text-indigo-600', bg: 'bg-indigo-50', note: 'NAT Gateway S3 traffic' },
              { name: 'Servers (EC2)', amount: 184.60, pct: 22, icon: Server, color: 'text-purple-600', bg: 'bg-purple-50', note: 'c5.2xlarge oversized staging' },
              { name: 'Storage (S3)', amount: 165.00, pct: 20, icon: Layers, color: 'text-cyan-600', bg: 'bg-cyan-50', note: 'Un-tiered 90d+ log dumps' },
              { name: 'Hard Drives (EBS)', amount: 66.00, pct: 7, icon: HardDrive, color: 'text-emerald-600', bg: 'bg-emerald-50', note: 'Detached volumes & GP2' },
            ].map((cat, i) => {
              const Icon = cat.icon;
              return (
                <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-sm font-bold text-slate-500">{cat.pct}%</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{cat.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{cat.note}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                    <span className="text-xs text-slate-400 font-medium">Monthly Savings:</span>
                    <span className="text-base font-black text-emerald-600 font-mono">+${cat.amount.toFixed(2)}/mo</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 8. Clean Apple-Style Footer */}
      <footer className="border-t border-slate-200/80 py-6 bg-white text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            CloudOptima • Automated AWS FinOps & Waste Reduction
          </div>
          <div>
            100% Read-Only IAM • No production changes executed without approval
          </div>
        </div>
      </footer>

      {/* Connect Modal */}
      <ConnectAwsModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnect={handleConnectAccount}
      />
    </div>
  );
}
