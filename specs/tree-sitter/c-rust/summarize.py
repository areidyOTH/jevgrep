import json,statistics
from pathlib import Path
root=Path(__file__).resolve().parent
rows=[json.loads(x) for x in (root/'results.jsonl').read_text().splitlines()][1:]
assert len(rows)==24
out=['# C and Rust follow-up results','','Published PR #27 (1493eaa), unchanged, versus upstream 2dc1d3c. Three fresh processes per case; medians of cold time and per-process median warm time. Synthetic fixtures, not real-world search-quality measurements.','','| Language | Functions | Cold before → after (ms) | Warm before → after (ms) | Named functions before → after | Candidate worker RSS (MiB) |','|---|---:|---:|---:|---:|---:|']
for lang in ['rust','c']:
 for count in [100,1500]:
  a={arm:[r for r in rows if r['language']==lang and r['count']==count and r['arm']==arm] for arm in ['before','after']}
  med=lambda arm,key:statistics.median(r[key] for r in a[arm])
  warm=lambda arm:statistics.median(statistics.median(r['warmMs']) for r in a[arm])
  rss=med('after','workerRSSKiB')/1024 if a['after'][0]['workerRSSKiB'] else None
  out.append(f"| {lang} | {count} | {med('before','coldTotalMs'):.1f} → {med('after','coldTotalMs'):.1f} | {warm('before'):.2f} → {warm('after'):.2f} | {a['before'][0]['namedFunctions']} → {a['after'][0]['namedFunctions']} | {rss:.1f} |" if rss else f"| {lang} | {count} | {med('before','coldTotalMs'):.1f} → {med('after','coldTotalMs'):.1f} | {warm('before'):.2f} → {warm('after'):.2f} | 0 → 0 | no worker |")
out += ['', 'Rust gains structural output: every expected function name and exact original CRLF/Unicode source slice passed. Its baseline is plain-text splitting, so these costs are not an apples-to-apples parser speed comparison. C remains unsupported structurally; both versions returned lossless plain-text fallback. Timing differences for C are control noise, not evidence of a parser improvement.', '', 'The existing six language regression tests also passed, covering Rust impl ownership, attributes, modules, traits, foreign declarations, raw names, syntax fallback and size fallback (plus Go coverage). These tests do not establish improved end-to-end search recall or exhaustive Rust language support.', '', 'Cold time includes module import and first inspection, but excludes container/Node launch. Warm time is ten inspections with fresh snapshot objects and an already initialized worker. RSS is sampled worker memory, not total application memory or peak worker usage. No C grammar was installed, no production files changed, no GitHub updates, and no Jev/provider calls occurred. Raw measurements and runnable scripts are alongside this report.']
(root/'RESULTS.md').write_text('\n'.join(out)+'\n')
print('\n'.join(out))
