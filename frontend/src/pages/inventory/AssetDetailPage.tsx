import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  useInventoryAsset,
  useAssignAsset,
  useCheckInAsset,
  useDisposeAsset,
  useDeleteAsset,
  useAssetAssignments,
} from '@/hooks/useInventory';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import {
  ArrowLeft,
  QrCode,
  UserCheck,
  Undo2,
  Trash2,
  PackageX,
  Camera,
} from 'lucide-react';
import type { AssignAssetInput } from '@/lib/inventoryApi';

const formatMoney = (v: number | null | undefined) =>
  v == null ? '—' : 'KSh ' + Number(v).toLocaleString();

const formatDate = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString() : '—';

export default function AssetDetailPage() {
  const { id } = useParams();
  const assetId = Number(id);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const showQr = searchParams.get('qr') === '1';

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState<AssignAssetInput>({
    assignee_type: 'student',
    assignee_id: 0,
    expected_return_at: null,
    note: null,
  });
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkInNote, setCheckInNote] = useState('');
  const [disposeOpen, setDisposeOpen] = useState(false);
  const [disposeNote, setDisposeNote] = useState('');

  const { data: asset, isLoading } = useInventoryAsset(assetId);
  const { data: assignmentsData } = useAssetAssignments(assetId, { page: 1, per_page: 10 });
  const assignAsset = useAssignAsset();
  const checkInAsset = useCheckInAsset();
  const disposeAsset = useDisposeAsset();
  const deleteAsset = useDeleteAsset();

  if (isLoading) return <PageSpinner />;
  if (!asset) return null;

  const activeAssignment = asset.active_assignment;

  const handleAssign = async () => {
    if (!assignForm.assignee_id) return;
    await assignAsset.mutateAsync({ id: assetId, data: assignForm });
    setAssignOpen(false);
    setAssignForm({ assignee_type: 'student', assignee_id: 0, expected_return_at: null, note: null });
  };

  const handleCheckIn = async () => {
    await checkInAsset.mutateAsync({ id: assetId, note: checkInNote || null });
    setCheckInOpen(false);
    setCheckInNote('');
  };

  const handleDispose = async () => {
    await disposeAsset.mutateAsync({ id: assetId, note: disposeNote || null });
    setDisposeOpen(false);
    setDisposeNote('');
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this asset permanently?')) return;
    await deleteAsset.mutateAsync(assetId);
    navigate('/inventory/assets');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={asset.name}
        description={asset.asset_code}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Inventory', href: '/inventory' },
          { label: 'Assets', href: '/inventory/assets' },
          { label: asset.name },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/inventory/assets')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            {asset.status === 'available' && (
              <Button onClick={() => setAssignOpen(true)}>
                <UserCheck className="h-4 w-4 mr-2" /> Assign
              </Button>
            )}
            {asset.status === 'assigned' && (
              <Button variant="outline" onClick={() => setCheckInOpen(true)}>
                <Undo2 className="h-4 w-4 mr-2" /> Check In
              </Button>
            )}
            {asset.status !== 'disposed' && asset.status !== 'lost' && (
              <Button variant="warning" onClick={() => setDisposeOpen(true)}>
                <PackageX className="h-4 w-4 mr-2" /> Dispose
              </Button>
            )}
            <Button variant="ghost" onClick={() => setSearchParams({ qr: '1' })}>
              <QrCode className="h-4 w-4 mr-2" /> QR
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-900">Details</h3>
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-slate-500">Status</dt>
                  <dd className="mt-1 font-medium text-slate-900 capitalize">{asset.status.replace(/_/g, ' ')}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Condition</dt>
                  <dd className="mt-1 font-medium text-slate-900 capitalize">{asset.condition}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Category</dt>
                  <dd className="mt-1 font-medium text-slate-900">{asset.category?.name ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Location</dt>
                  <dd className="mt-1 font-medium text-slate-900">{asset.location?.name ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Serial Number</dt>
                  <dd className="mt-1 font-medium text-slate-900">{asset.serial_number ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Purchase Cost</dt>
                  <dd className="mt-1 font-medium text-slate-900">{formatMoney(asset.purchase_cost)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Purchase Date</dt>
                  <dd className="mt-1 font-medium text-slate-900">{formatDate(asset.purchase_date)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Supplier</dt>
                  <dd className="mt-1 font-medium text-slate-900">{asset.supplier ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Robotics Equipment</dt>
                  <dd className="mt-1 font-medium text-slate-900">{asset.robotics_equipment?.name ?? '—'}</dd>
                </div>
              </dl>
              {asset.notes && <p className="mt-4 text-sm text-slate-600">{asset.notes}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-900">Assignment History</h3>
              {!assignmentsData?.results || assignmentsData.results.length === 0 ? (
                <EmptyState title="No assignments" description="This asset has not been assigned yet." />
              ) : (
                <div className="mt-4 divide-y divide-slate-100">
                  {assignmentsData.results.map((a) => (
                    <div key={a.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {a.assignee?.name ?? 'Unknown'} <span className="text-xs text-slate-400">({a.assignee_type.replace(/_/g, ' ')})</span>
                        </p>
                        <p className="text-xs text-slate-500">
                          Assigned {formatDate(a.assigned_at)} → Returned {formatDate(a.returned_at)}
                          {a.expected_return_at && !a.returned_at ? ` · Expected ${formatDate(a.expected_return_at)}` : ''}
                        </p>
                      </div>
                      {a.returned_at ? (
                        <Badge variant="secondary">Checked in</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-900">QR Code</h3>
              <div className="mt-4 flex flex-col items-center gap-3">
                {showQr ? (
                  <p className="text-xs font-mono break-all text-slate-500 text-center">{asset.qr_code}</p>
                ) : (
                  <>
                    <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-slate-50 border border-slate-200">
                      <Camera className="h-10 w-10 text-slate-300" />
                    </div>
                    <p className="text-xs text-slate-500">Scan to look up this asset</p>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={() => setSearchParams({ qr: showQr ? '1' : '1' })}>
                  <QrCode className="h-4 w-4 mr-2" /> {showQr ? 'Hide value' : 'Show value'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {activeAssignment && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-slate-900">Currently assigned to</h3>
                <p className="mt-2 text-lg font-bold text-slate-900">{activeAssignment.assignee?.name ?? 'Unknown'}</p>
                <p className="text-sm text-slate-500 capitalize">{activeAssignment.assignee_type.replace(/_/g, ' ')}</p>
                <p className="mt-1 text-xs text-slate-500">Since {formatDate(activeAssignment.assigned_at)}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Assign dialog */}
      <DialogRoot open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Asset</DialogTitle>
            <DialogDescription>Assign this asset to a student, employee or robotics team.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Assignee Type</Label>
              <SelectRoot
                value={assignForm.assignee_type}
                onValueChange={(v) => setAssignForm({ ...assignForm, assignee_type: v as AssignAssetInput['assignee_type'], assignee_id: 0 })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="robotics_team">Robotics Team</SelectItem>
                </SelectContent>
              </SelectRoot>
            </div>
            <Input
              label="Assignee ID"
              type="number"
              value={assignForm.assignee_id || ''}
              onChange={(e) => setAssignForm({ ...assignForm, assignee_id: Number(e.target.value) })}
              placeholder="Enter the assignee ID"
            />
            <Input
              label="Expected Return Date"
              type="date"
              value={assignForm.expected_return_at ?? ''}
              onChange={(e) => setAssignForm({ ...assignForm, expected_return_at: e.target.value || null })}
            />
            <Textarea
              label="Note"
              value={assignForm.note ?? ''}
              onChange={(e) => setAssignForm({ ...assignForm, note: e.target.value || null })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign} loading={assignAsset.isPending} disabled={!assignForm.assignee_id}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Check-in dialog */}
      <DialogRoot open={checkInOpen} onOpenChange={setCheckInOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check In Asset</DialogTitle>
            <DialogDescription>Return this asset and make it available again.</DialogDescription>
          </DialogHeader>
          <Textarea label="Note" value={checkInNote} onChange={(e) => setCheckInNote(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckInOpen(false)}>Cancel</Button>
            <Button onClick={handleCheckIn} loading={checkInAsset.isPending}>Check In</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Dispose dialog */}
      <DialogRoot open={disposeOpen} onOpenChange={setDisposeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispose Asset</DialogTitle>
            <DialogDescription>Mark this asset as disposed of. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <Textarea label="Reason" value={disposeNote} onChange={(e) => setDisposeNote(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisposeOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDispose} loading={disposeAsset.isPending}>Dispose</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
