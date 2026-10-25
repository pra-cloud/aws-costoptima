import React, { useState } from 'react';
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
  Info
} from 'lucide-react';
import ConnectAwsModal from './components/ConnectAwsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations', 'copilot', 'breakdown'
  const [filterRisk, setFilterRisk] = useState('ALL'); // 'ALL', 'SAFE', 'ZERO_DOWNTIME'
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  
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
      icon: Database,
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
      icon: Network,
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
      icon: Server,
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
      icon: Layers,
      title: "Missing S3 Intelligent-Tiering Policy",
      humanSummary: "Bucket contains 14 TB of logs and snapshots older than 90 days stored in S3 Standard. Enabling Intelligent-Tiering automatically moves inactive objects to cheaper archive tiers.",
      savings: 165.00,
      currentCost: 322.00,
      risk: "100% Safe",
      riskLevel: "safe",
      riskExplanation: "100% safe. Files remain instantly accessible anytime without retrieval fees.",
      howToFix: "Apply an S3 Intelligent-Tiering lifecycle rule to the bucket.",
      cli: "aws s3api put-bucket-lifecycle-configuration --bucket hyperzod-app-logs --lifecycle-configuration file://lifecycle.json",
      resourceId: "hyperzod-app-logs"
    },
    {
      id: "ebs-zombie-vol-03b91fa8e2",
      category: "Storage",
      icon: HardDrive,
      title: "Zombie Unattached EBS Volume (500 GB)",
      humanSummary: "500 GB volume left unattached for 42 days after its parent server was deleted. It is attached to nothing, yet AWS continues charging $50.00/month for storing it.",
      savings: 50.00,
      currentCost: 50.00,
      risk: "100% Safe",
      riskLevel: "safe",
      riskExplanation: "100% safe. We create a safety snapshot before deleting the orphaned volume.",
      howToFix: "Create a final safety snapshot, then delete the unattached volume.",
      cli: "aws ec2 create-snapshot --volume-id vol-03b91fa8e2 --description 'Backup prior to deletion' && aws ec2 delete-volume --volume-id vol-03b91fa8e2",
      resourceId: "vol-03b91fa8e2 (available)"
    },
    {
      id: "gp2-upgrade-vol-08491bb4",
      category: "Storage",
      icon: HardDrive,
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
      icon: Network,
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

  const baseMonthlySpend = 3840.00;
  const totalPotentialSavings = findings.reduce((acc, f) => acc + f.savings, 0);
  const realizedSavings = findings
    .filter(f => resolvedIds.includes(f.id))
    .reduce((acc, f) => acc + f.savings, 0);

  const targetOptimizedBill = baseMonthlySpend - totalPotentialSavings;
  const currentLiveBill = baseMonthlySpend - realizedSavings;
  const efficiencyScore = Math.min(100, Math.round(78 + (realizedSavings / totalPotentialSavings) * 22));

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
        setChatMessages(prev => [...prev, { sender: 'bot', text: "Here is what I recommend: You can delete the detached EBS volume ($50/mo) and release unattached Elastic IPs ($10.80/mo) immediately. Both actions are 100% safe and carry zero downtime." }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { sender: 'bot', text: "Here is what I recommend: You can delete the detached EBS volume ($50/mo) and release unattached Elastic IPs ($10.80/mo) immediately. Both actions are 100% safe and carry zero downtime." }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const filteredFindings = findings.filter(f => {
    if (filterRisk === 'SAFE') return f.riskLevel === 'safe';
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
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-500">Account:</span>
              <span className="font-mono text-slate-900 font-semibold">123456789012 (Production)</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-mono text-[11px]">us-east-1</span>
            </div>

            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition active:scale-[0.98]"
            >
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              Connect AWS
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 2. Executive Presentation Hero Card (Apple Light Theme) */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-10 shadow-sm relative overflow-hidden">
          {/* Subtle light background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 opacity-70"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Executive Summary */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Verified Cost Audit • 21.9% Recoverable Spend
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Reduce your AWS bill by{' '}
                <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-4">
                  ${totalPotentialSavings.toFixed(2)}
                </span>{' '}
                every month.
              </h1>

              <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                We identified <strong className="text-slate-900 font-semibold">{findings.length} actionable cost leaks</strong> across your cloud infrastructure. You are paying for test databases with idle standby replicas, unattached storage from deleted servers, and unrouted backup traffic.
              </p>

              {/* Real-time claimed savings tracker */}
              <div className="pt-2 space-y-2">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Savings Claimed: <strong className="text-emerald-600 font-mono font-bold">${realizedSavings.toFixed(2)}/mo</strong></span>
                  <span>Target: <strong className="text-slate-900 font-mono font-bold">${totalPotentialSavings.toFixed(2)}/mo</strong></span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/60">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(4, (realizedSavings / totalPotentialSavings) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Right Column: Clean Before vs After Cards */}
            <div className="lg:col-span-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Monthly Cloud Spend Comparison
                </h3>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                  21.9% Less
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Before */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-center shadow-sm">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase block">Current Bill</span>
                  <div className="text-2xl font-black text-slate-400 mt-1 line-through">
                    ${baseMonthlySpend.toFixed(0)}
                  </div>
                  <span className="text-[10px] text-rose-600 mt-1 block font-semibold">Paying full price</span>
                </div>

                {/* After */}
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center relative overflow-hidden shadow-sm">
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase block">Optimized Bill</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    ${targetOptimizedBill.toFixed(0)}
                  </div>
                  <span className="text-[10px] text-emerald-700 mt-1 block font-bold">
                    Save ${(totalPotentialSavings * 12).toFixed(0)}/yr
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Zero-Risk Immediate Fixes:
                </span>
                <span className="font-bold text-emerald-600 font-mono">+$265.80/month</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Executive Metric Cards (Apple Light Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Identified Waste</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                ${totalPotentialSavings.toFixed(2)}
                <span className="text-xs font-semibold text-slate-500 ml-1">/mo</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Annual impact: <span className="text-emerald-600 font-bold">${(totalPotentialSavings * 12).toFixed(0)}/yr</span>
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Current Monthly Spend</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                ${currentLiveBill.toFixed(2)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Target: <span className="text-slate-800 font-semibold">${targetOptimizedBill.toFixed(0)}/mo</span>
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Cloud Efficiency</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                {efficiencyScore}%
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {efficiencyScore}<span className="text-sm text-slate-400 font-normal">/100</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${efficiencyScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Actionable Leaks</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {findings.length - resolvedIds.length} <span className="text-xs font-normal text-slate-500">Pending</span>
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
                100% Safe (3)
              </button>
              <button
                onClick={() => setFilterRisk('ZERO_DOWNTIME')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterRisk === 'ZERO_DOWNTIME'
                    ? 'bg-blue-50 text-blue-800 border border-blue-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Zero Downtime (5)
              </button>
            </div>
          )}
        </div>

        {/* 5. Tab 1: Recommendations List (Apple Light Theme Cards) */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            {filteredFindings.map((item) => {
              const isResolved = resolvedIds.includes(item.id);
              const isExpanded = expandedId === item.id;
              const Icon = item.icon;

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
                        <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                          {item.humanSummary}
                        </p>
                      </div>
                    </div>

                    {/* Right Savings & Action */}
                    <div className="flex items-center justify-between md:justify-end gap-5 pl-14 md:pl-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      <div className="text-left md:text-right">
                        <div className="text-xl font-black text-emerald-600 font-mono">
                          +${item.savings.toFixed(2)}
                          <span className="text-xs font-semibold text-slate-500">/mo</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium block">
                          Save ${(item.savings * 12).toFixed(0)}/year
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Interactive Mark as Fixed */}
                        <button
                          onClick={() => toggleResolve(item.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border shadow-sm ${
                            isResolved
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {isResolved ? 'Resolved' : 'Mark Fixed'}
                        </button>

                        {/* Accordion toggle */}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
                          title="View 1-Click Fix Command"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded 1-Click CLI Command Drawer */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/80 p-6 rounded-b-2xl space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-blue-600" />
                          How to fix this in AWS CLI:
                        </span>

                        <button
                          onClick={() => handleCopy(item.id, item.cli)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                        >
                          {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedId === item.id ? 'Copied to Clipboard!' : 'Copy Command'}
                        </button>
                      </div>

                      <p className="text-xs text-slate-500">
                        {item.riskExplanation}
                      </p>

                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-100 overflow-x-auto selection:bg-blue-600 selection:text-white">
                        {item.cli}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 6. Tab 2: AI Cost Copilot Interactive Chat (Apple Style) */}
        {activeTab === 'copilot' && (
          <div className="rounded-3xl bg-white border border-slate-200/90 p-8 shadow-sm space-y-5 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">AI FinOps Copilot</h3>
                <p className="text-xs text-slate-500">Trained on your real AWS infrastructure telemetry</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="space-y-3.5 min-h-[300px] max-h-[450px] overflow-y-auto pr-2">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                        : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isAiTyping && (
                <div className="flex justify-start">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 animate-pulse">
                    AI is analyzing your AWS infrastructure...
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompt Pills */}
            <div className="pt-2 flex flex-wrap gap-2">
              {[
                "Which fixes are 100% safe to do right now?",
                "How can I cut RDS cost without breaking prod?",
                "Generate Terraform code for GP3 storage"
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputQuestion(suggestion)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] text-slate-700 font-medium transition"
                >
                  💬 {suggestion}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="flex gap-2 pt-2">
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
        onConnect={() => {}}
      />
    </div>
  );
}
