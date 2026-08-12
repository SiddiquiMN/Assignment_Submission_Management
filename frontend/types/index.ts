export type Role='Admin'|'Teacher'|'Student';
export type User={id:string;name:string;email:string;role:Role;classId?:string|null};
export type Assignment={id:string;title:string;description:string;deadline:string;maxMarks:number;status:string;teacherId:string;classId:string;subjectId:string};
export type Submission={id:string;assignmentId:string;studentId:string;answer:string;submittedAt:string;status:string;marks?:number|null;feedback?:string|null};
