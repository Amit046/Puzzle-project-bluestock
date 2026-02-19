import { describe, it, expect } from 'vitest'
import { calcScore, evaluateWordGuess } from '../lib/puzzleEngine'

describe('calcScore', () => {
  it('returns 0 when not completed', () => {
    expect(calcScore({ timeTaken:60, difficulty:'easy', hintsUsed:0, attempts:1, completed:false })).toBe(0)
  })
  it('faster = higher score', () => {
    const fast = calcScore({ timeTaken:20, difficulty:'medium', hintsUsed:0, attempts:1, completed:true })
    const slow = calcScore({ timeTaken:250, difficulty:'medium', hintsUsed:0, attempts:1, completed:true })
    expect(fast).toBeGreaterThan(slow)
  })
  it('hint penalty reduces score', () => {
    const a = calcScore({ timeTaken:60, difficulty:'easy', hintsUsed:0, attempts:1, completed:true })
    const b = calcScore({ timeTaken:60, difficulty:'easy', hintsUsed:2, attempts:1, completed:true })
    expect(a).toBeGreaterThan(b)
  })
  it('minimum score is 10', () => {
    expect(calcScore({ timeTaken:9999, difficulty:'hard', hintsUsed:2, attempts:4, completed:true })).toBeGreaterThanOrEqual(10)
  })
})

describe('evaluateWordGuess', () => {
  it('all correct', () => {
    expect(evaluateWordGuess('CRANE','CRANE')).toEqual(['correct','correct','correct','correct','correct'])
  })
  it('detects absent', () => {
    const r = evaluateWordGuess('ZZZZZ','CRANE')
    expect(r.every(x => x === 'absent')).toBe(true)
  })
  it('detects present', () => {
    const r = evaluateWordGuess('NACRE','CRANE')
    expect(r[0]).toBe('present') // N is in CRANE but not pos 0
  })
  it('correct takes priority over present', () => {
    const r = evaluateWordGuess('CRANE','CRANE')
    expect(r[0]).toBe('correct')
  })
})
