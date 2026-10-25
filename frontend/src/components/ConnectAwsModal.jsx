import React, { useState } from 'react';
import { X, ShieldCheck, Key, Copy, Check, Sparkles, ArrowRight, Zap, Cloud, AlertCircle, Loader2 } from 'lucide-react';

export default function ConnectAwsModal({ isOpen, onClose, onConnect }) {
  const [activeTab, setActiveTab] = useState('keys'); // Default to keys as it's the fastest
  const [roleArn, setRoleArn] = useState('');
  const [externalId] = useState('cloudoptima-' + Math.random().toString(36).substring(2, 10));
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [region, setRegion] = useState('ap-south-1');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleCopyExternalId = () => {
    navigator.clipboard.writeText(externalId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitRole = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onConnect({
        role_arn: roleArn,
        external_id: externalId,
        region,
        is_demo: false,
      });
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to assume role. Please verify your Role ARN.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitKeys = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onConnect({
        access_key: accessKey.trim(),
        secret_key: secretKey.trim(),
        region,
        is_demo: false,
      });
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to authenticate AWS credentials. Please check your keys and permissions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLaunchDemo = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onConnect({ is_demo: true });
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load demo data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-white border border-slate-200/80 shadow-2xl p-7 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Connect AWS Account</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Zero-risk read-only IAM access. CloudOptima cannot alter or delete your servers.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <div>
              <span className="font-bold block">AWS Connection Notice:</span>
              <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Segmented tabs */}
        <div className="flex p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('keys'); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'keys'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            IAM Read-Only Keys
          </button>
          <button
            onClick={() => { setActiveTab('cloudformation'); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'cloudformation'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            1-Click CloudFormation
          </button>
          <button
            onClick={() => { setActiveTab('demo'); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === 'demo'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Demo Architecture
          </button>
        </div>

        {/* Tab 1: IAM Keys */}
        {activeTab === 'keys' && (
          <form onSubmit={handleSubmitKeys} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-emerald-800 space-y-1">
              <span className="font-bold block">Safe & 100% Read-Only:</span>
              <p className="text-[11px] leading-relaxed text-emerald-700">
                Attach the AWS-managed <strong>SecurityAudit</strong> or <strong>ReadOnlyAccess</strong> policy to your user. Our scanner only executes describe and list calls.
              </p>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">AWS Access Key ID</label>
              <input
                type="text"
                required
                placeholder="AKIAIOSFODNN7EXAMPLE"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-slate-800 font-mono text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">AWS Secret Access Key</label>
              <input
                type="password"
                required
                placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-slate-800 font-mono text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Primary Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              >
                <option value="ap-south-1">Asia Pacific (Mumbai) [ap-south-1]</option>
                <option value="us-east-1">US East (N. Virginia) [us-east-1]</option>
                <option value="us-west-2">US West (Oregon) [us-west-2]</option>
                <option value="eu-west-1">Europe (Ireland) [eu-west-1]</option>
                <option value="eu-central-1">Europe (Frankfurt) [eu-central-1]</option>
                <option value="ap-southeast-1">Asia Pacific (Singapore) [ap-southeast-1]</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !accessKey || !secretKey}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-md shadow-blue-500/20 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Scanning AWS Cloud...
                  </>
                ) : (
                  <>
                    Start Deep Cost Scan
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: CloudFormation */}
        {activeTab === 'cloudformation' && (
          <form onSubmit={handleSubmitRole} className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
              <span className="font-bold text-slate-900 block text-xs">Quick 3-Step Setup:</span>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed">
                <li>Deploy our read-only CloudFormation stack in your AWS console.</li>
                <li>It creates a secure Cross-Account role with AWS SecurityAudit policy.</li>
                <li>Paste the resulting Role ARN below to start the scan.</li>
              </ol>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Your Security External ID</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={externalId}
                  className="flex-1 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-slate-700 font-mono text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyExternalId}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Created Role ARN</label>
              <input
                type="text"
                required
                placeholder="arn:aws:iam::123456789012:role/CloudOptimaCostOptimizerRole-..."
                value={roleArn}
                onChange={(e) => setRoleArn(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-slate-800 font-mono text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !roleArn}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-md shadow-blue-500/20 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Verifying Role...' : 'Connect & Scan Cloud'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Demo */}
        {activeTab === 'demo' && (
          <div className="space-y-4 text-xs">
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Instant Evaluation Mode</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Experience CloudOptima immediately with our verified production cloud dataset ($3,840/month active spend) with 7 detected waste items across EC2, EBS, RDS, S3, and NAT Gateways.
              </p>
            </div>

            <button
              onClick={handleLaunchDemo}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition transform active:scale-[0.99]"
            >
              {isSubmitting ? 'Loading Architecture...' : 'Load Production Demo ($839/mo Savings)'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
