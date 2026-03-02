export class SkillRegistry {
  private skills = [
    { id: 'workflow-launch', name: 'Workflow Launch', category: 'Orchestration', status: 'ready' },
    { id: 'neon-postgres', name: 'Neon Postgres', category: 'Database', status: 'optimized' },
    { id: 'review-security', name: 'Review Security', category: 'Quality', status: 'scanning' },
    { id: 'sentinel', name: 'The Sentinel', category: 'Autonomous', status: 'alert' },
    { id: 'archivist', name: 'The Archivist', category: 'Memory', status: 'learning' }
  ];

  public getSkills() {
    return this.skills;
  }

  public registerSkill(skill: any) {
    this.skills.push(skill);
  }
}
