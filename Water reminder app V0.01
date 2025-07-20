import tkinter as tk
from tkinter import ttk
from datetime import datetime
import collections
import discord_presence
class AdaptiveRoutineWaterReminder:
    def __init__(self, root):
        self.root = root
        self.root.title("Adaptive Routine Water Reminder")
        self.root.overrideredirect(True)
        self.root.attributes("-topmost", True)

        self.bg_color = "#000000"
        self.fg_color = "#26ff00"
        self.root.configure(bg=self.bg_color)

        self.screen_width = root.winfo_screenwidth()
        self.screen_height = root.winfo_screenheight()

        # Start in full mode
        self.min_mode = False

        self.default_interval = 30 * 60  # 30 minutes in seconds
        self.time_left = self.default_interval
        self.sound_on = True

        self.max_log_length = 5
        self.drink_times = collections.deque(maxlen=self.max_log_length)

        # Fonts for full and min mode
        self.font_large = ("Courier New", 32, "bold")
        self.font_medium = ("Courier New", 16)
        self.font_small = ("Courier New", 12)
        self.font_min_timer = ("Courier New", 14, "bold")

        self.create_widgets()
        self.position_window()
        self.update_timer()
        self.make_draggable()

    def create_widgets(self):
        # Clear any existing widgets if recreating (for mode switch)
        for widget in self.root.winfo_children():
            widget.destroy()

        if self.min_mode:
            # Minimal mode layout: small timer and small gear button
            self.root.geometry(f"120x50+{self.screen_width - 140}+{self.screen_height - 100}")
            self.root.attributes("-transparentcolor", self.bg_color)

            self.timer_label = tk.Label(self.root, text=self.format_time(self.time_left),
                                        fg=self.fg_color, bg=self.bg_color, font=self.font_min_timer)
            self.timer_label.pack(side="left", padx=(10,5), pady=10)

            self.settings_btn = tk.Button(self.root, text="⚙", fg=self.fg_color, bg=self.bg_color,
                                          font=("Courier New", 20), bd=0,
                                          activebackground=self.bg_color, activeforeground=self.fg_color,
                                          command=self.open_settings, cursor="hand2")
            self.settings_btn.pack(side="right", padx=(5,10), pady=5)

        else:
            # Full mode layout: big timer, progress bar, settings button
            width, height = 320, 220
            self.root.geometry(f"{width}x{height}+{self.screen_width - width - 30}+{self.screen_height - height - 60}")
            self.root.attributes("-transparentcolor", self.bg_color)

            self.timer_label = tk.Label(self.root, text=self.format_time(self.time_left),
                                        fg=self.fg_color, bg=self.bg_color, font=self.font_large)
            self.timer_label.pack(pady=(25, 10))

            style = ttk.Style()
            style.theme_use('default')
            style.configure("green.Horizontal.TProgressbar", troughcolor=self.bg_color,
                            background=self.fg_color, thickness=26, bordercolor=self.bg_color)

            self.progress = ttk.Progressbar(self.root, style="green.Horizontal.TProgressbar",
                                            length=280, mode='determinate', maximum=self.default_interval)
            self.progress.pack(pady=(0, 20))
            self.progress['value'] = self.time_left

            self.settings_btn = tk.Button(self.root, text="⚙ Settings", fg=self.fg_color, bg=self.bg_color,
                                          font=self.font_medium, bd=1, relief="ridge",
                                          activebackground="#1a3a1a", activeforeground=self.fg_color,
                                          command=self.open_settings, cursor="hand2")
            self.settings_btn.pack(pady=(0, 15), ipadx=10, ipady=5)

    def position_window(self):
        # Reposition window on screen if needed (used after mode switch)
        if self.min_mode:
            width, height = 120, 50
        else:
            width, height = 320, 220
        x = self.screen_width - width - 30
        y = self.screen_height - height - 60
        self.root.geometry(f"{width}x{height}+{x}+{y}")

    def format_time(self, seconds):
        m, s = divmod(seconds, 60)
        return f"{int(m):02d}:{int(s):02d}"

    def update_timer(self):
        if self.time_left > 0:
            self.time_left -= 1
            if self.min_mode:
                self.timer_label.config(text=self.format_time(self.time_left))
            else:
                self.timer_label.config(text=self.format_time(self.time_left))
                self.progress['value'] = self.time_left

            try:
                discord_presence.update_status(self.time_left)
            except Exception:
                pass

            self.root.after(1000, self.update_timer)
        else:
            self.remind_popup()



    def remind_popup(self):
        popup_width, popup_height = 320, 160
        x = max(self.root.winfo_x() - popup_width - 20, 20)
        y = min(self.root.winfo_y(), self.screen_height - popup_height - 40)

        popup = tk.Toplevel(self.root)
        popup.title("Hydration Reminder")
        popup.configure(bg=self.bg_color)
        popup.geometry(f"{popup_width}x{popup_height}+{x}+{y}")
        popup.attributes("-topmost", True)

        msg = tk.Label(popup, text="Time to drink water! 💧",
                       fg=self.fg_color, bg=self.bg_color, font=self.font_large)
        msg.pack(pady=(20, 15))

        def drank():
            now = datetime.now()
            self.log_drink_time(now)
            popup.destroy()
            self.reset_timer()

        def not_now():
            self.shorten_interval()
            popup.destroy()
            self.reset_timer()

        btn_frame = tk.Frame(popup, bg=self.bg_color)
        btn_frame.pack(pady=10)

        btn_opts = dict(fg=self.fg_color, bg=self.bg_color, font=self.font_medium,
                        width=14, bd=2, relief="ridge", cursor="hand2",
                        activebackground="#1a3a1a", activeforeground=self.fg_color)

        drank_btn = tk.Button(btn_frame, text="I've drank", command=drank, **btn_opts)
        drank_btn.grid(row=0, column=0, padx=15)

        not_now_btn = tk.Button(btn_frame, text="Not right now", command=not_now, **btn_opts)
        not_now_btn.grid(row=0, column=1, padx=15)

    def log_drink_time(self, timestamp):
        self.drink_times.append(timestamp)
        if len(self.drink_times) > 1:
            intervals = []
            for i in range(1, len(self.drink_times)):
                delta = (self.drink_times[i] - self.drink_times[i-1]).total_seconds()
                intervals.append(delta)
            avg_interval = sum(intervals) / len(intervals)
            self.default_interval = int(avg_interval)
            self.default_interval = max(15*60, min(self.default_interval, 2*60*60))
        else:
            self.default_interval = 30 * 60

    def shorten_interval(self):
        new_interval = int(self.default_interval * 0.9)
        self.default_interval = max(new_interval, 15*60)

    def reset_timer(self):
        self.time_left = self.default_interval
        if not self.min_mode:
            self.progress['maximum'] = self.default_interval
            self.progress['value'] = self.time_left
        self.timer_label.config(text=self.format_time(self.time_left))
        self.update_timer()

    def open_settings(self):
        settings_width, settings_height = 360, 220
        x = (self.screen_width - settings_width) // 2
        y = (self.screen_height - settings_height) // 2

        settings_win = tk.Toplevel(self.root)
        settings_win.title("Settings")
        settings_win.geometry(f"{settings_width}x{settings_height}+{x}+{y}")
        settings_win.configure(bg=self.bg_color)
        settings_win.grab_set()

        # Base interval setting
        tk.Label(settings_win, text="Base reminder interval (minutes):",
                 fg=self.fg_color, bg=self.bg_color, font=self.font_medium).pack(pady=(20, 8))
        interval_var = tk.IntVar(value=self.default_interval // 60)
        interval_entry = tk.Spinbox(settings_win, from_=15, to=120, textvariable=interval_var,
                                    font=self.font_medium, width=6)
        interval_entry.pack()

        # Sound toggle
        sound_var = tk.BooleanVar(value=self.sound_on)
        sound_check = tk.Checkbutton(settings_win, text="Sound On", variable=sound_var,
                                     fg=self.fg_color, bg=self.bg_color, font=self.font_medium,
                                     selectcolor=self.bg_color, activebackground=self.bg_color)
        sound_check.pack(pady=(15, 15))

        # Mode toggle
        mode_var = tk.BooleanVar(value=self.min_mode)
        mode_check = tk.Checkbutton(settings_win, text="Minimal Mode", variable=mode_var,
                                    fg=self.fg_color, bg=self.bg_color, font=self.font_medium,
                                    selectcolor=self.bg_color, activebackground=self.bg_color)
        mode_check.pack(pady=(0, 15))

        def save_settings():
            self.default_interval = interval_var.get() * 60
            self.sound_on = sound_var.get()
            new_mode = mode_var.get()
            changed_mode = (new_mode != self.min_mode)
            self.min_mode = new_mode

            settings_win.destroy()

            if changed_mode:
                self.create_widgets()
                self.position_window()

            self.reset_timer()

        save_btn = tk.Button(settings_win, text="Save", command=save_settings,
                             fg=self.fg_color, bg=self.bg_color, font=self.font_medium, bd=2,
                             relief="ridge", cursor="hand2", activebackground="#1a3a1a", activeforeground=self.fg_color)
        save_btn.pack(pady=(0, 20), ipadx=10, ipady=5)

    def make_draggable(self):
        def start_move(event):
            self.x = event.x
            self.y = event.y

        def do_move(event):
            deltax = event.x - self.x
            deltay = event.y - self.y
            x = self.root.winfo_x() + deltax
            y = self.root.winfo_y() + deltay
            self.root.geometry(f"+{x}+{y}")

        self.root.bind("<Button-1>", start_move)
        self.root.bind("<B1-Motion>", do_move)

if __name__ == "__main__":
    root = tk.Tk()
    app = AdaptiveRoutineWaterReminder(root)
    root.mainloop()
