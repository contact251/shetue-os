import { ProgressOverview } from "@/components/dashboard/ProgressOverview";
import { ChecklistSystem } from "@/components/tasks/ChecklistSystem";
import { Task, ChecklistItem, CostItem } from "@/types";

// SEED DATA: Based on Shetue Duplex & Electrical Report 2026
const dummyTask: Task = {
  id: "t1",
  project_id: "p1",
  title: "Electrical Conduit & Boxing (GF)",
  category: "MEP",
  status: "in-progress",
  weightage: 10,
};

const dummyChecklist: ChecklistItem[] = [
  { id: "c1", task_id: "t1", item: "Marking as per electrical drawing", is_completed: true },
  { id: "c2", task_id: "t1", item: "Chipping for conduit lines", is_completed: true },
  { id: "c3", task_id: "t1", item: "Fixing DB box and switch boxes", is_completed: false },
  { id: "c4", task_id: "t1", item: "Conduit layout level verification", is_completed: false },
];

const dummyCosts: CostItem[] = [
  { id: "cost1", task_id: "t1", item_name: "PVC Pipe (3/4 inch) - Walton", quantity: 50, unit_price: 150, total_cost: 7500 },
  { id: "cost2", task_id: "t1", item_name: "Circular Box / MK Box (Plastic)", quantity: 20, unit_price: 85, total_cost: 1700 },
  { id: "cost3", task_id: "t1", item_name: "Labor Cost (First phase)", quantity: 1, unit_price: 5000, total_cost: 5000 },
];

export default function Dashboard() {
  return (
    <div className="space-y-10">
      <section>
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Real-time Metrics</h3>
        </div>
        <ProgressOverview 
          overallProgress={42} 
          totalTasks={156} 
          doneTasks={65} 
          budgetSpent={1250000} 
        />
      </section>

      <section>
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Checklist</h3>
            <p className="text-slate-500 text-sm mt-1">Shetue Duplex House / Noakhali</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChecklistSystem 
            task={dummyTask} 
            items={dummyChecklist} 
            costs={dummyCosts} 
          />
          
          <div className="bg-white p-6 rounded-xl border border-dashed border-slate-300 flex flex-center items-center justify-center text-slate-400 text-sm italic">
            Select another task from the sidebar to view details...
          </div>
        </div>
      </section>
    </div>
  );
}
