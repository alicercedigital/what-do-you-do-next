const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const model = data.model?.display_name || 'Unknown';
const ctx = data.context_window;
const cost = data.cost;

function fmtTokens(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'k';
  return n.toString();
}

function fmtDuration(ms) {
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return sec + 's';
  const min = Math.floor(sec / 60);
  if (min < 60) return min + 'm';
  const hrs = Math.floor(min / 60);
  const remMin = min % 60;
  return hrs + 'h' + (remMin ? remMin + 'm' : '');
}

function fmtCost(usd) {
  if (usd < 0.01) return '$' + usd.toFixed(4);
  if (usd < 1) return '$' + usd.toFixed(2);
  return '$' + usd.toFixed(2);
}

const parts = [model];

// Context: 25k/200k (12%)
if (ctx?.current_usage) {
  const used = ctx.current_usage.input_tokens + ctx.current_usage.cache_creation_input_tokens + ctx.current_usage.cache_read_input_tokens;
  const total = ctx.context_window_size;
  const pct = Math.round((used / total) * 100);
  parts.push(`ctx: ${fmtTokens(used)}/${fmtTokens(total)} (${pct}%)`);
}

// Output tokens
if (ctx?.total_output_tokens) {
  parts.push(`out: ${fmtTokens(ctx.total_output_tokens)}`);
}

// Cost
if (cost?.total_cost_usd != null) {
  parts.push(fmtCost(cost.total_cost_usd));
}

// Duration
if (cost?.total_duration_ms) {
  parts.push(fmtDuration(cost.total_duration_ms));
}

// Lines changed
if (cost?.total_lines_added != null || cost?.total_lines_removed != null) {
  const added = cost.total_lines_added || 0;
  const removed = cost.total_lines_removed || 0;
  parts.push(`+${added}/-${removed}`);
}

console.log(parts.join(' | '));
