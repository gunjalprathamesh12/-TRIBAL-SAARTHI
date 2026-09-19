import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useNotification } from '../context/NotificationContext.jsx';
import {
  Sliders,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Code,
  Save,
  Play,
} from 'lucide-react';

const SchemeRuleBuilderPage = () => {
  const [schemes, setSchemes] = useState([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState('');
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  // Rule Form State
  const [ruleForm, setRuleForm] = useState({
    ruleCode: '',
    ruleName: '',
    field: 'annualFamilyIncome',
    operator: '<=',
    expectedValue: '250000',
    actionOnFail: 'NOT_ELIGIBLE',
    failureMessage: 'Annual family income exceeds scheme ceiling.',
    successMessage: 'Annual family income verified within statutory threshold.',
    meritWeight: 15,
  });

  // Test Runner State
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const { addToast } = useNotification();

  const fetchSchemes = async () => {
    try {
      const res = await api.get('/schemes');
      if (res.success && res.data.length > 0) {
        setSchemes(res.data);
        if (!selectedSchemeId) setSelectedSchemeId(res.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRules = async () => {
    if (!selectedSchemeId) return;
    setLoading(true);
    try {
      const res = await api.get(`/schemes/${selectedSchemeId}/rules`);
      if (res.success) {
        setRules(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  useEffect(() => {
    fetchRules();
  }, [selectedSchemeId]);

  const handleOpenAddRule = () => {
    setEditingRule(null);
    setRuleForm({
      ruleCode: `RULE_${Date.now().toString().slice(-4)}`,
      ruleName: 'Custom Scheme Eligibility Condition',
      field: 'annualFamilyIncome',
      operator: '<=',
      expectedValue: '250000',
      actionOnFail: 'NOT_ELIGIBLE',
      failureMessage: 'Criteria benchmark not satisfied.',
      successMessage: 'Criteria validated successfully.',
      meritWeight: 10,
    });
    setRuleModalOpen(true);
  };

  const handleOpenEditRule = (rule) => {
    setEditingRule(rule);
    setRuleForm({
      ruleId: rule._id,
      ruleCode: rule.ruleCode,
      ruleName: rule.ruleName,
      field: rule.field,
      operator: rule.operator,
      expectedValue: Array.isArray(rule.expectedValue)
        ? rule.expectedValue.join(', ')
        : String(rule.expectedValue),
      actionOnFail: rule.actionOnFail,
      failureMessage: rule.failureMessage,
      successMessage: rule.successMessage || 'Criteria met',
      meritWeight: rule.meritWeight || 10,
    });
    setRuleModalOpen(true);
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    try {
      let parsedValue = ruleForm.expectedValue;
      if (['IN', 'NOT IN'].includes(ruleForm.operator)) {
        parsedValue = ruleForm.expectedValue.split(',').map((s) => s.trim());
      } else if (
        ['annualFamilyIncome', 'previousExamMarksPercentage', 'age', 'qsWorldRank'].includes(
          ruleForm.field
        )
      ) {
        parsedValue = Number(ruleForm.expectedValue);
      }

      await api.post(`/schemes/${selectedSchemeId}/rules`, {
        ...ruleForm,
        expectedValue: parsedValue,
      });

      addToast({
        title: 'Rule Saved Successfully',
        message: `Configured condition [${ruleForm.ruleCode}] has been updated.`,
        type: 'success',
      });
      setRuleModalOpen(false);
      fetchRules();
    } catch (err) {
      addToast({ title: 'Failed to save rule', message: err.userMessage, type: 'error' });
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;
    try {
      await api.delete(`/schemes/rules/${ruleId}`);
      addToast({ title: 'Rule Deleted', message: 'The rule was deleted.', type: 'info' });
      fetchRules();
    } catch (err) {
      addToast({ title: 'Delete failed', message: err.userMessage, type: 'error' });
    }
  };

  const handleRunRuleTest = async () => {
    setTesting(true);
    try {
      const res = await api.post('/ai/eligibility', {
        schemeId: selectedSchemeId,
        applicantProfile: {
          category: 'ST',
          annualFamilyIncome: 180000,
          currentEducationLevel: 'Undergraduate',
          previousExamMarksPercentage: 78,
          institutionType: 'Premier Institute (IIT/NIT/IIM/AIIMS)',
          isPVTG: true,
        },
      });
      if (res.success) {
        setTestResult(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sliders className="w-6 h-6 text-gov-navy-900" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gov-navy-950">
              Configurable Scheme Rule Builder
            </h1>
          </div>
          <p className="text-xs text-slate-600">
            Define eligibility rules with operators (==, !=, &gt;, &lt;, &gt;=, &lt;=, IN, NOT IN). Zero hardcoding.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunRuleTest}
            disabled={testing}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-gov-navy-900" />
            {testing ? 'Testing Rules...' : 'Test Rules on Sample ST Profile'}
          </button>

          <button
            onClick={handleOpenAddRule}
            className="bg-gov-navy-900 hover:bg-gov-navy-800 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>
      </div>

      {/* Scheme Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
            Target MoTA Scheme:
          </span>
          <select
            value={selectedSchemeId}
            onChange={(e) => setSelectedSchemeId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-gov-navy-900 text-xs focus:outline-none focus:ring-2 focus:ring-gov-navy-900"
          >
            {schemes.map((s) => (
              <option key={s._id} value={s._id}>
                {s.shortTitle} ({s.schemeCode})
              </option>
            ))}
          </select>
        </div>

        <span className="text-[11px] text-slate-500 font-mono">
          Active Rules: {rules.length} conditions
        </span>
      </div>

      {/* Test Result Banner if triggered */}
      {testResult && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 space-y-2 text-xs animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-950 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-700" />
              Dynamic Rule Engine Evaluation: {testResult.decision}
            </span>
            <span className="font-mono text-emerald-800 font-bold">
              Score: {testResult.compositeMeritScore}/100
            </span>
          </div>
          <div className="text-[11px] text-emerald-900">
            Passed {testResult.ruleResults?.filter((r) => r.passed).length} of{' '}
            {testResult.ruleResults?.length} rules tested against ST sample profile.
          </div>
        </div>
      )}

      {/* Rules Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">Loading scheme rules...</div>
        ) : rules.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No rules configured for this scheme yet. Click "Add Rule" to configure.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="p-3.5">Rule Code</th>
                  <th className="p-3.5">Rule Name & Target Field</th>
                  <th className="p-3.5">Operator</th>
                  <th className="p-3.5">Benchmark Value</th>
                  <th className="p-3.5">Action on Fail</th>
                  <th className="p-3.5">Merit Weight</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {rules.map((rule) => (
                  <tr key={rule._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-gov-navy-900">
                      {rule.ruleCode}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{rule.ruleName}</div>
                      <div className="text-[11px] font-mono text-slate-500">field: {rule.field}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-amber-900 border border-slate-200">
                        {rule.operator}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-medium text-slate-800">
                      {Array.isArray(rule.expectedValue)
                        ? `[${rule.expectedValue.join(', ')}]`
                        : String(rule.expectedValue)}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          rule.actionOnFail === 'NOT_ELIGIBLE'
                            ? 'bg-red-100 text-red-800'
                            : rule.actionOnFail === 'NEEDS_HUMAN_REVIEW'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {rule.actionOnFail}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold font-mono text-slate-900">
                      +{rule.meritWeight || 0} pts
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditRule(rule)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-gov-navy-900"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule._id)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add or Edit Rule */}
      {ruleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-gov-navy-950">
              {editingRule ? 'Edit Rule Condition' : 'Configure New Scheme Rule'}
            </h3>

            <form onSubmit={handleSaveRule} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rule Code *</label>
                  <input
                    type="text"
                    required
                    value={ruleForm.ruleCode}
                    onChange={(e) => setRuleForm({ ...ruleForm, ruleCode: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Field *</label>
                  <select
                    value={ruleForm.field}
                    onChange={(e) => setRuleForm({ ...ruleForm, field: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  >
                    <option value="annualFamilyIncome">annualFamilyIncome</option>
                    <option value="category">category</option>
                    <option value="currentEducationLevel">currentEducationLevel</option>
                    <option value="previousExamMarksPercentage">previousExamMarksPercentage</option>
                    <option value="institutionType">institutionType</option>
                    <option value="isPVTG">isPVTG</option>
                    <option value="qsWorldRank">qsWorldRank</option>
                    <option value="hasMandatoryDocuments">hasMandatoryDocuments</option>
                    <option value="disabilityStatus">disabilityStatus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rule Name / Title *</label>
                <input
                  type="text"
                  required
                  value={ruleForm.ruleName}
                  onChange={(e) => setRuleForm({ ...ruleForm, ruleName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operator *</label>
                  <select
                    value={ruleForm.operator}
                    onChange={(e) => setRuleForm({ ...ruleForm, operator: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                  >
                    <option value="==">== (Equal to)</option>
                    <option value="!=">!= (Not Equal to)</option>
                    <option value="<=">&lt;= (Less than or equal)</option>
                    <option value=">=">&gt;= (Greater than or equal)</option>
                    <option value="<">&lt; (Strictly less than)</option>
                    <option value=">">&gt; (Strictly greater than)</option>
                    <option value="IN">IN (Within allowed list)</option>
                    <option value="NOT IN">NOT IN (Disallowed)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Benchmark Value *
                  </label>
                  <input
                    type="text"
                    required
                    value={ruleForm.expectedValue}
                    onChange={(e) => setRuleForm({ ...ruleForm, expectedValue: e.target.value })}
                    placeholder="e.g. 250000 or Class 11, Class 12"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Action on Fail</label>
                  <select
                    value={ruleForm.actionOnFail}
                    onChange={(e) => setRuleForm({ ...ruleForm, actionOnFail: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="NOT_ELIGIBLE">NOT_ELIGIBLE (Hard Stop)</option>
                    <option value="NEEDS_HUMAN_REVIEW">NEEDS_HUMAN_REVIEW (Flagged)</option>
                    <option value="WARNING">WARNING (Advisory only)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Merit Points (+)</label>
                  <input
                    type="number"
                    value={ruleForm.meritWeight}
                    onChange={(e) => setRuleForm({ ...ruleForm, meritWeight: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Failure Explanation Message</label>
                <input
                  type="text"
                  required
                  value={ruleForm.failureMessage}
                  onChange={(e) => setRuleForm({ ...ruleForm, failureMessage: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRuleModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gov-navy-900 hover:bg-gov-navy-800 text-white font-bold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemeRuleBuilderPage;
