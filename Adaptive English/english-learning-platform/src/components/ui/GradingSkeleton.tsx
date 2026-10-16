import styles from './GradingSkeleton.module.css';

export function GradingSkeleton({ multiline = false }: { multiline?: boolean }) {
  return <div aria-hidden="true" data-grading-skeleton className={`${styles.surface} p-3 space-y-2`}>
    <div className={styles.line} style={{ width: multiline ? '94%' : '24%', marginTop: multiline ? 0 : 5 }} />
    {multiline && <><div className={styles.line} style={{ width: '100%' }} /><div className={styles.line} style={{ width: '87%' }} /><div className={styles.line} style={{ width: '94%' }} /><div className={styles.line} style={{ width: '62%' }} /></>}
  </div>;
}
