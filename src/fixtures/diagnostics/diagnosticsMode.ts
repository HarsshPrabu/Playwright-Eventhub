import { DiagnosticsMode } from '../../config/env.config';

export function shouldAttachDiagnostics(mode: DiagnosticsMode, testPassed: boolean): boolean {
  return mode === 'always' || (mode === 'failure' && !testPassed);
}
