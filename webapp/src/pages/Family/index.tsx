import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Widget } from '@components/widget';
import { staggerContainer, fadeUpItem } from '../../shared/lib/animations';
import { useQuery } from '../../shared/hooks/use-api';
import { Button, Chip, Skeleton, Modal, useOverlayState, TextField, Input, Label, Select, ListBox, DatePicker, DateField, Calendar } from '@heroui/react';
import { useAuth } from '../../shared/context/AuthContext';
import { api } from '../../shared/lib/api';
import { Person, PersonPlus, HeartPulse, FaceSmile, Sun } from '@gravity-ui/icons';
import { type CalendarDate } from '@internationalized/date';

interface FamilyMemberItem {
  _id: string;
  name: string;
  gender: string;
  avatar?: string;
  birthday?: string;
  isHome: boolean;
  healthStatus?: { overall: 'good' | 'warning' | 'alert'; notes?: string };
  emotionRecords?: { emotion: string; timestamp: string; context?: string }[];
}

const genderLabels: Record<string, string> = {
  male: '男',
  female: '女',
};

const genderOptions = [
  { key: 'male', label: '男' },
  { key: 'female', label: '女' },
];

const healthLabels: Record<string, string> = {
  good: '良好',
  warning: '注意',
  alert: '警告',
};

const healthColors: Record<string, 'success' | 'warning' | 'danger'> = {
  good: 'success',
  warning: 'warning',
  alert: 'danger',
};

function calcAge(birthday?: string): number | null {
  if (!birthday) return null;
  const b = new Date(birthday);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

export function FamilyPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { data: members, loading, refetch } = useQuery<FamilyMemberItem[]>('/family');
  const [form, setForm] = useState({ name: '', gender: 'male', birthday: null as CalendarDate | null, password: '' });
  const [saving, setSaving] = useState(false);
  const modalState = useOverlayState();

  const openAdd = useCallback(() => {
    setForm({ name: '', gender: 'male', birthday: null, password: '' });
    modalState.open();
  }, [modalState]);

  const handleSave = useCallback(async () => {
    if (!form.name.trim() || !form.password) return;
    setSaving(true);
    await api.post('/family', {
      name: form.name.trim(),
      gender: form.gender,
      birthday: form.birthday ? form.birthday.toString() : undefined,
      password: form.password,
    });
    setSaving(false);
    modalState.close();
    refetch();
  }, [form, modalState, refetch]);

  return (
    <motion.div
      animate="show"
      className="space-y-6"
      initial="hidden"
      variants={staggerContainer}
    >
      <motion.div variants={fadeUpItem} className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-lg font-semibold">
          <Person className="size-5" />
          家庭成员
        </h2>
        {isAdmin && (
        <Modal state={modalState}>
          <Button size="sm" variant="primary" onPress={openAdd}>
            <PersonPlus className="size-3.5" />
            添加成员
          </Button>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>添加家庭成员</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <div className="space-y-4">
                    <TextField value={form.name} onChange={(value) => setForm({ ...form, name: value })} isRequired>
                      <Label>姓名</Label>
                      <Input placeholder="请输入姓名" />
                    </TextField>
                    <Select
                      selectedKey={form.gender}
                      onSelectionChange={(key) => setForm({ ...form, gender: String(key) })}
                    >
                      <Label>性别</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {genderOptions.map((g) => (
                            <ListBox.Item key={g.key} id={g.key} textValue={g.label}>
                              <Label>{g.label}</Label>
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                    <TextField value={form.password} onChange={(value) => setForm({ ...form, password: value })} isRequired>
                      <Label>登录密码</Label>
                      <Input type="password" placeholder="设置登录密码" />
                    </TextField>
                    <DatePicker
                      className="w-full"
                      value={form.birthday}
                      onChange={(v) => setForm({ ...form, birthday: v })}
                    >
                      <Label>出生日期</Label>
                      <DateField.Group fullWidth>
                        <DateField.Input>
                          {(segment) => <DateField.Segment segment={segment} />}
                        </DateField.Input>
                        <DateField.Suffix>
                          <DatePicker.Trigger>
                            <DatePicker.TriggerIndicator />
                          </DatePicker.Trigger>
                        </DateField.Suffix>
                      </DateField.Group>
                      <DatePicker.Popover>
                        <Calendar>
                          <Calendar.Header>
                            <Calendar.YearPickerTrigger>
                              <Calendar.YearPickerTriggerHeading />
                              <Calendar.YearPickerTriggerIndicator />
                            </Calendar.YearPickerTrigger>
                            <Calendar.NavButton slot="previous" />
                            <Calendar.NavButton slot="next" />
                          </Calendar.Header>
                          <Calendar.Grid>
                            <Calendar.GridHeader>
                              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                            </Calendar.GridHeader>
                            <Calendar.GridBody>
                              {(date) => <Calendar.Cell date={date} />}
                            </Calendar.GridBody>
                          </Calendar.Grid>
                          <Calendar.YearPickerGrid>
                            <Calendar.YearPickerGridBody>
                              {({ year }) => <Calendar.YearPickerCell year={year} />}
                            </Calendar.YearPickerGridBody>
                          </Calendar.YearPickerGrid>
                        </Calendar>
                      </DatePicker.Popover>
                    </DatePicker>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button slot="close">取消</Button>
                  <Button variant="primary" onPress={handleSave} isDisabled={!form.name.trim() || !form.password || saving}>
                    {saving ? '保存中...' : '保存'}
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
        )}
      </motion.div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Widget key={i}>
              <Widget.Content>
                <div className="flex items-start gap-3">
                  <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-20 rounded" />
                    <Skeleton className="h-4 w-16 rounded" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-14 rounded" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                </div>
              </Widget.Content>
            </Widget>
          ))}
        </div>
      )}

      {!loading && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={staggerContainer}
        >
          {members?.map((member) => {
            const age = calcAge(member.birthday);
            return (
              <motion.div key={member._id} variants={fadeUpItem}>
                <Widget>
                  <Widget.Content>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center text-lg font-medium text-neutral-600 shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-base truncate">{member.name}</h3>
                          <Chip size="sm" variant="soft" color={member.isHome ? 'success' : 'default'}>
                            {member.isHome ? '在家' : '外出'}
                          </Chip>
                        </div>
                        <p className="text-sm text-neutral-500 mt-0.5">
                          {genderLabels[member.gender] || ''}
                          {age !== null && ` · ${age}岁`}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2">
                      {member.birthday && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-sm text-neutral-500">
                            <Sun className="size-3.5" />
                            出生日期
                          </span>
                          <span className="text-sm">{member.birthday.split('T')[0]}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-sm text-neutral-500">
                          <HeartPulse className="size-3.5" />
                          健康状态
                        </span>
                        <Chip
                          size="sm"
                          color={healthColors[member.healthStatus?.overall || 'good']}
                          variant="soft"
                        >
                          {healthLabels[member.healthStatus?.overall || 'good']}
                        </Chip>
                      </div>

                      {(() => {
                        const lastEmotion = member.emotionRecords?.slice(-1)[0];
                        if (!lastEmotion) return null;
                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1 text-sm text-neutral-500">
                                <FaceSmile className="size-3.5" />
                                最近情绪
                              </span>
                              <span className="text-sm">{lastEmotion.emotion}</span>
                            </div>
                            {lastEmotion.context && (
                              <div className="mt-2">
                                <p className="text-xs text-neutral-400">{lastEmotion.context}</p>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </Widget.Content>
                </Widget>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {!loading && (!members || members.length === 0) && (
        <motion.div variants={fadeUpItem} className="text-center py-12">
          <p className="text-neutral-500">暂无家庭成员</p>
        </motion.div>
      )}
    </motion.div>
  );
}
