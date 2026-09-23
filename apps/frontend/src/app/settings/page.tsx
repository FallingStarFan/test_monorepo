'use client';

import { Keyboard, Monitor, Moon, Sun } from 'lucide-react';

import { UiScaleControls } from '@/components/layout/ui-scale-controls';
import {
  UI_SCALE_STEPS,
  useUiScale,
} from '@/components/providers/ui-scale-provider';
import { useTheme, type Theme } from '@/components/providers/theme-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: '淺色', icon: Sun },
  { value: 'dark', label: '深色', icon: Moon },
  { value: 'system', label: '跟隨系統', icon: Monitor },
];

const SHORTCUTS = [
  { keys: 'Ctrl / ⌘ + =', action: '放大介面' },
  { keys: 'Ctrl / ⌘ + -', action: '縮小介面' },
  { keys: 'Ctrl / ⌘ + 0', action: '重設為 100%' },
];

export default function SettingsPage() {
  const { scale, setScale, canIncrease, canDecrease } = useUiScale();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>介面縮放</CardTitle>
          <CardDescription>
            以根字級調整介面尺寸，只影響文字與間距，不改變版面結構；
            設定會保存在瀏覽器，重新整理後仍會套用。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <UiScaleControls />
            <span className="text-sm text-muted-foreground">
              目前 {Math.round(scale * 100)}%
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {UI_SCALE_STEPS.map((step) => (
              <Button
                key={step}
                variant={step === scale ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScale(step)}
                disabled={step === scale}
              >
                {Math.round(step * 100)}%
              </Button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            可選級距 {Math.round(UI_SCALE_STEPS[0] * 100)}%–
            {Math.round(UI_SCALE_STEPS[UI_SCALE_STEPS.length - 1] * 100)}%
            {canIncrease && canDecrease
              ? '，目前位於中間級距。'
              : canIncrease
                ? '，目前為最小級距。'
                : '，目前為最大級距。'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>外觀主題</CardTitle>
          <CardDescription>
            可固定使用淺色或深色，也可跟隨作業系統設定自動切換。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = theme === option.value;

            return (
              <Button
                key={option.value}
                variant={active ? 'default' : 'outline'}
                onClick={() => setTheme(option.value)}
              >
                <Icon className="size-4" />
                {option.label}
                {active ? (
                  <Badge variant="secondary" className="ml-1">
                    目前
                  </Badge>
                ) : null}
              </Button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="size-4" />
            鍵盤快捷鍵
          </CardTitle>
          <CardDescription>
            縮放屬於高頻操作，提供快捷鍵可避免反覆移動滑鼠。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">按鍵</TableHead>
                <TableHead>動作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SHORTCUTS.map((item) => (
                <TableRow key={item.keys}>
                  <TableCell className="font-mono text-xs sm:text-sm">
                    {item.keys}
                  </TableCell>
                  <TableCell className="text-sm">{item.action}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
