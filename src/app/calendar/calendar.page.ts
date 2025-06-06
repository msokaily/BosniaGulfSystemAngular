import { Component, OnInit } from '@angular/core';
import { CustomInput, SharedService } from '../services/shared.service';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { ApiService } from '../services/api/api.service';
import { PopoverController } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { EVENTS, EventsService } from '../services/events/events.service';
import { CanPipe } from '../can.pipe';
import { FilterPage } from '../filter/filter.page';
import { DayConfig } from '@googlproxer/ion-range-calendar';
import { EditPagePage } from '../edit-page/edit-page.page';

interface Reservation {
  start_at: string;
  end_at: string;
  name: string;
  image: string;
  id: number; // Unique identifier for each reservation
  item_id: number;
  customer: string;
}

interface Day {
  day: number | null;
}

interface ReservationBlock extends Reservation {
  cellIndex: number; // index in the full days array where this block starts
  span: number;      // number of day cells this block spans
  row: number;       // row number (0-based) where this block starts
  stackIndex: number; // stacking order in that row (will be consistent across rows for the same reservation)
  top: number;       // computed top position in pixels (relative to its row container)
  left: number;      // computed left offset in percentage
  width: number;     // computed width in percentage
  resId: number;     // unique id for the original reservation
  color: string;     // unique color computed based on the reservation id
}

interface RowData {
  days: Day[];                  // exactly 7 day cells (or placeholders)
  rowNumber: number;
  height: number;               // computed row height (in pixels)
  reservations: ReservationBlock[]; // reservation blocks that start in this row
}

interface MonthData {
  month: string;
  year: number;
  monthIndex: number;
  rows: RowData[];
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit {

  pageName = 'orders-calendar';

  filterValues: any;
  items: any[] = [];

  loadingIndicator = false;

  randomToken = 1;

  selectedYear: number = 0;
  selectedMonth: number = 0;

  cars: any[] = [];
  accommodations: any[] = [];
  drivers: any[] = [];

  months: MonthData[] = [];

  // reservations
  reservations: Reservation[] = [];

  inputs: CustomInput[] = [];

  pop!: HTMLIonPopoverElement;

  hoveredReservation: ReservationBlock | null = null;
  tooltipX = 0;
  tooltipY = 0;
  tooltipOnLeft = false;
  tooltipOnTop = false;

  // Grid settings
  readonly columns: number = 7;
  readonly baseRowHeight: number = 70;           // base height (in pixels) of a day cell (without reservations)
  readonly gap: number = 5;                        // gap (in pixels) between day cells
  readonly reservationHeight: number = 20;         // height of each reservation block
  readonly reservationVerticalGap: number = 2;     // vertical gap between stacked reservation blocks

  constructor(
    private auth: AuthenticationService,
    private api: ApiService,
    public shared: SharedService,
    private popoverCtrl: PopoverController,
    private events: EventsService,
    private datePipe: DatePipe,
    private canPipe: CanPipe
  ) {
    this.events.listen.subscribe(resp => {
      if (resp.name == EVENTS.refreshOrders) {
        this.refresh(true);
      }
    });
  }

  get user() {
    return this.auth.user;
  }

  get selectedDate() {
    const d = new Date();
    if (this.selectedYear) {
      d.setFullYear(this.selectedYear);
    }
    if (this.selectedMonth) {
      d.setMonth(this.selectedMonth);
    }
    return this.datePipe.transform(d, 'Y MMMM');
  }

  get selectedDateObj() {
    const d = new Date();
    if (this.selectedYear) {
      d.setFullYear(this.selectedYear);
    }
    if (this.selectedMonth) {
      d.setMonth(this.selectedMonth);
    }
    return d;
  }

  async ngOnInit() {
    this.loadingIndicator = true;
    const nowDate = new Date();
    this.selectedYear = nowDate.getFullYear();
    this.selectedMonth = nowDate.getMonth();
    const respAccommodations = await this.api.accommodations({});
    if (respAccommodations) { this.accommodations = respAccommodations.map((v: any) => { return { id: v?.id, name: v?.name, image: v?.image_url?.url } }); };
    const respCars = await this.api.cars({});
    if (respCars) { this.cars = respCars.map((v: any) => { return { id: v?.id, name: v?.name, image: v?.image_url?.url } }); };
    const respDrivers = await this.api.drivers({});
    if (respDrivers) { this.drivers = respDrivers.map((v: any) => { return { id: v?.id, name: v?.name, image: v?.image_url?.url } }); };

    // console.log({accommodations: this.accommodations, cars: this.cars, drivers: this.drivers});

    this.refresh();
  }

  async refresh(hideLoading = false) {
    if (!hideLoading) {
      this.loadingIndicator = true;
    }

    const params = { ...(this.filterValues ?? {}), ...{ year: this.selectedYear, month: this.selectedMonth + 1, expand_months: 1 } }
    const resp: [] = await this.api.orders(params);
    if (resp) {
      let items = resp
        .filter((v: any) => v.products?.length > 0)
        .flatMap((v: any) => {
          return v.products.map((product: any) => ({
            ...product,
            customer: v.name,
            user_id: v.user_id,
          }));
        });
      if (this.filterValues?.productType && this.filterValues?.productType?.length > 0) {
        items = items.filter(v => this.filterValues?.productType.includes(v.type));
      }
      this.items = items;
      this.reservations = this.items.map((reserv: any) => {
        return {
          customer: reserv.customer,
          id: reserv.id,
          name: reserv?.product?.name ?? '-',
          start_at: reserv.start_at,
          end_at: reserv.end_at,
          image: reserv?.product?.image ?? null,
          item_id: reserv.item_id
        } as Reservation;
      });
    }
    // console.log({ reservations: this.reservations, items: this.items });

    await this.generateCalendar();

    this.loadingIndicator = false;
  }

  getColorForId(id: number): string {
    const hue = (id * 137) % 360; // Multiply by a prime number to distribute hues
    return `hsl(${hue}, 70%, 60%, 50%)`;
  }

  async generateCalendar() {
    return new Promise(resolve => {
      const currentDate = new Date(this.selectedYear, this.selectedMonth, 1);
      const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

      this.months = [
        this.generateMonth(previousMonth.getFullYear(), previousMonth.getMonth()),
        this.generateMonth(currentDate.getFullYear(), currentDate.getMonth()),
        this.generateMonth(nextMonth.getFullYear(), nextMonth.getMonth()),
      ];
      resolve(true);
    });
  }

  formatDate(dateString: string): string {
    return this.datePipe.transform(dateString, 'Y-MM-dd') || '';
  }

  getDayName(dayNumber: number, year: number, monthIndex: number): string {
    if (dayNumber === null) return '';
    const date = new Date(year, monthIndex, dayNumber);
    return this.datePipe.transform(date, 'EEE') || ''; // Returns 'Mon', 'Tue', etc.
  }

  getVisibleDays(month: MonthData): Day[] {
    return month.rows.flatMap(row => row.days).filter(day => day.day !== null);
  }

  getMonthReservations(month: MonthData): ReservationBlock[] {
    return month.rows.flatMap(row => row.reservations);
  }

  // Modified generateMonth to handle cross-month reservations properly
  private generateMonth(year: number, month: number): MonthData {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayIndex = firstDay.getDay();

    // Create days array
    const days: Day[] = [];
    for (let i = 0; i < firstDayIndex; i++) days.push({ day: null });
    for (let i = 1; i <= daysInMonth; i++) days.push({ day: i });

    // Split into weeks
    const rows: RowData[] = [];
    while (days.length > 0) {
      const weekDays = days.splice(0, 7);
      rows.push({
        days: weekDays,
        rowNumber: rows.length,
        height: this.baseRowHeight,
        reservations: []
      });
    }

    // Process reservations
    const reservationBlocks: ReservationBlock[] = [];
    this.reservations.forEach(res => {
      const startDate = new Date(res.start_at);
      const endDate = new Date(res.end_at);

      // Split reservation into monthly chunks
      let currentStart = new Date(Math.max(startDate.getTime(), firstDay.getTime()));
      let currentEnd = new Date(Math.min(endDate.getTime(), lastDay.getTime()));

      while (currentStart <= currentEnd) {
        const monthStart = new Date(currentStart.getFullYear(), currentStart.getMonth(), 1);
        const monthEnd = new Date(currentStart.getFullYear(), currentStart.getMonth() + 1, 0);

        const startDay = currentStart.getDate();
        const endDay = Math.min(currentEnd.getDate(), monthEnd.getDate());
        const span = endDay - startDay + 1;
        const cellIndex = firstDayIndex + startDay - 1;

        if (currentStart.getMonth() === month) {
          reservationBlocks.push({
            ...res,
            cellIndex,
            span,
            row: Math.floor(cellIndex / 7),
            stackIndex: 0, // Set during stacking
            top: 0,
            left: 0,
            width: 0,
            resId: res.id,
            color: this.getColorForId(res.item_id)
          });
        }

        // Move to next month chunk
        currentStart = new Date(currentStart.getFullYear(), currentStart.getMonth() + 1, 1);
        currentEnd = new Date(Math.min(endDate.getTime(), new Date(currentStart.getFullYear(), currentStart.getMonth() + 1, 0).getTime()));
      }
    });

    // Improved stacking algorithm
    this.stackReservations(reservationBlocks);

    // Assign to rows and calculate heights
    rows.forEach(row => {
      row.reservations = reservationBlocks.filter(res => res.row === row.rowNumber);
      const maxStack = row.reservations.reduce((max, res) => Math.max(max, res.stackIndex), 0);
      row.height = this.baseRowHeight + (maxStack + 1) * 25;
    });

    return {
      month: firstDay.toLocaleString('default', { month: 'long' }),
      monthIndex: month,
      year,
      rows
    };
  }

  // Improved stacking logic using interval partitioning
  private stackReservations(reservations: ReservationBlock[]) {
    // Sort reservations by start cell and span
    reservations.sort((a, b) => a.cellIndex - b.cellIndex || b.span - a.span);

    const lanes: ReservationBlock[][] = [];

    reservations.forEach(res => {
      let laneFound = false;

      // Try to find a lane where this reservation doesn't overlap
      for (let i = 0; i < lanes.length; i++) {
        const lastInLane = lanes[i][lanes[i].length - 1];
        if (lastInLane.cellIndex + lastInLane.span <= res.cellIndex) {
          lanes[i].push(res);
          res.stackIndex = i;
          laneFound = true;
          break;
        }
      }

      // If no lane found, create new one
      if (!laneFound) {
        res.stackIndex = lanes.length;
        lanes.push([res]);
      }
    });
  }

  // Updated positioning calculations
  calculateLeft(reservation: ReservationBlock, month: MonthData): number {
    const firstVisibleIndex = month.rows[0].days.findIndex(d => d.day !== null);
    const dayWidth = 45;
    return (reservation.cellIndex - firstVisibleIndex) * dayWidth;
  }

  calculateWidth(reservation: ReservationBlock, month: MonthData): number {
    const dayWidth = 45;
    return reservation.span * dayWidth;
  }

  showTooltip(reservation: ReservationBlock, event: MouseEvent) {
    this.hoveredReservation = reservation;
    this.updateTooltipPosition(event);
  }

  updateTooltipPosition(event: MouseEvent) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const tooltipWidth = 300;
    const tooltipHeight = 150;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Calculate available space
    const spaceRight = windowWidth - mouseX - 20;
    const spaceLeft = mouseX - 20;
    const spaceBelow = windowHeight - mouseY - 20;
    const spaceAbove = mouseY - 20;

    // Determine position
    this.tooltipOnLeft = spaceRight < tooltipWidth && spaceLeft > spaceRight;
    this.tooltipOnTop = spaceBelow < tooltipHeight && spaceAbove > spaceBelow;

    // Set position
    this.tooltipX = mouseX - 280;
    this.tooltipY = mouseY;
  }

  hideTooltip() {
    this.hoveredReservation = null;
  }

  getDuration(reservation: ReservationBlock): number {
    const start = new Date(reservation.start_at);
    const end = new Date(reservation.end_at);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24)) + 1;
  }

  async edit(id: number, data?: any, errors?: any) {
    const index = this.items.findIndex(v => v?.id == id);
    if (this.user?.id === this.items[index]?.user_id || ['admin'].includes(this.user?.role)) { } else { return; };
    let products = [];
    const productType = this.items[index]?.type;
    if (productType == 'accommodation') {
      products = this.accommodations.map(v => { return { id: v?.id, name: v?.name, image: v?.image_url?.url } });
    } else if (productType == 'driver') {
      products = this.drivers.map(v => { return { id: v?.id, name: v?.name, image: v?.image_url?.url } });
    } else {
      products = this.cars.map(v => { return { id: v?.id, name: v?.name, image: v?.image_url?.url } });
    }
    let isFirst = true;
    let min_date = new Date(new Date().getTime() - (60 * 60 * 24 * 30 * 12 * 1000));
    const inputs: CustomInput[] = [
      {
        name: 'customer_name',
        type: 'text',
        title: await this.shared.trans('customer'),
        value: this.items[index]?.customer || '',
        required: false,
        readonly: true
      },
      {
        name: 'item_id',
        type: 'select',
        title: await this.shared.trans(productType),
        value: parseInt(data?.item_id) || parseInt(this.items[index]?.item_id) || null,
        options: products,
        required: true,
        changed: (newValue: any) => {
          const value = newValue?.detail?.value;
          const product = (productType == 'accommodation' ? this.accommodations : this.cars).find(v => v?.id == value);
          const active_reservations: any[] = product?.active_reservations || [];
          const inputs = this.inputs;
          let disabledDates: any[] = [];
          if (active_reservations.length > 0) {
            active_reservations.forEach((v: any, i) => {
              disabledDates = [...disabledDates, ...this.shared.getDatesBetween(new Date(v?.start_at), new Date(v?.end_at))];
            });
          }
          const disabledDays: DayConfig[] = [];
          disabledDates?.forEach(async day => {
            disabledDays.push({
              date: day,
              disable: true,
              subTitle: await this.shared.trans('reserved')
            });
          });

          inputs[inputs.findIndex(v => v.name == 'reservation_date')].dateRangeOptions = { daysConfig: disabledDays };
          this.pop.componentProps = { ...this.pop.componentProps, ...{ inputs: inputs } };
          if (!isFirst) {
            let formData: Record<string, any> = {
              price: product?.price
            };
            this.events.publish({ name: EVENTS.setFormData, data: formData });
          }
          isFirst = false;
        }
      },
      {
        name: 'reservation_date',
        type: 'dateRange',
        title: await this.shared.trans('reservation_date'),
        value: data?.reservation_date || { from: { dateObj: new Date(this.items[index]?.start_at), string: this.datePipe.transform(this.items[index]?.start_at, 'YYYY-MM-dd') }, to: { dateObj: new Date(this.items[index]?.end_at), string: this.datePipe.transform(this.items[index]?.end_at, 'YYYY-MM-dd') } },
        min: min_date,
        required: true
      },
      {
        name: 'price',
        type: 'number',
        title: await this.shared.trans('price'),
        value: data?.price || this.items[index]?.price || 0,
        required: true,
        min: 0
      },
    ];

    if (productType == 'driver') {
      inputs.push({
        name: 'extra',
        type: 'select',
        title: await this.shared.trans('car'),
        value: parseInt(data?.extra) || parseInt(this.items[index]?.extra) || null,
        options: this.cars.map(v => { return { id: v?.id, name: v?.name, image: v?.image_url?.url } }),
        required: true,
      });
    }

    inputs.push({
      name: 'note',
      type: 'textarea',
      title: await this.shared.trans('note'),
      value: data?.note || this.items[index]?.note || null,
      required: false
    });

    this.inputs = inputs;
    this.pop = await this.popoverCtrl.create({
      component: EditPagePage,
      cssClass: 'editpage-popover',
      backdropDismiss: false,
      dismissOnSelect: false,
    });
    this.pop.componentProps = {
      pop: this.pop,
      inputs: this.inputs,
      errors: errors || []
    };
    this.pop.onDidDismiss().then(async v => {
      this.randomToken = Math.random() * 1000;
      if (v.role == 'data') {

        return;
      }
      if (v.role === 'success') {
        const loading = await this.shared.loading({ message: await this.shared.trans('common.saving') });
        const data: any = v.data;
        data.order_id = this.items[index]?.order_id;
        data.type = productType;
        data.start_at = data?.reservation_date?.from?.string;
        data.end_at = data?.reservation_date?.to?.string;
        const resp = await this.api.orderProductsUpdate(this.items[index]?.id, data);
        loading.dismiss();
        if (!resp?.status) {
          this.edit(id, data, resp?.data?.errors);
        }
        this.refresh(true);
      }
    });
    this.pop.present();
  }

  async openFilter() {
    const orderStatus = (await this.api.constants())?.order_status;
    const filters: CustomInput[] = [
      {
        name: 'month',
        type: 'date',
        title: await this.shared.trans('the_month'),
        value: this.filterValues?.month ? this.filterValues?.month : this.datePipe.transform(new Date(), 'Y-MM-dd'),
        format: 'Y-MM',
        // max: this.datePipe.transform(new Date(), 'Y-MM')
      },
      {
        name: 'search',
        type: 'text',
        title: await this.shared.trans('search'),
        value: this.filterValues?.search || ''
      },
      {
        name: 'status',
        type: 'select',
        title: await this.shared.trans('status'),
        value: this.filterValues?.status || null,
        options: orderStatus.map((v: any, i: number) => { return { id: i, name: v[this.shared.lang] }; }),
        multiple: true
      },
      {
        name: 'productType',
        type: 'select',
        title: await this.shared.trans('type'),
        value: this.filterValues?.productType || null,
        options: [
          { id: 'accommodation', name: await this.shared.trans('accommodation') },
          { id: 'car', name: await this.shared.trans('car') },
          { id: 'driver', name: await this.shared.trans('driver') }
        ],
        multiple: true,
      },
      {
        name: 'accommodation_ids',
        type: 'select',
        title: await this.shared.trans('accommodations'),
        value: this.filterValues?.accommodation_ids || null,
        options: this.accommodations,
        multiple: true,
      },
      {
        name: 'car_ids',
        type: 'select',
        title: await this.shared.trans('cars'),
        value: this.filterValues?.car_ids || null,
        options: this.cars,
        multiple: true,
      },
      {
        name: 'driver_ids',
        type: 'select',
        title: await this.shared.trans('drivers'),
        value: this.filterValues?.driver_ids || null,
        options: this.drivers,
        multiple: true,
      },
    ];
    const pop = await this.popoverCtrl.create({
      component: FilterPage,
      cssClass: 'filter-popover',
      backdropDismiss: true,
    });
    pop.componentProps = {
      pop,
      filters
    };
    pop.onDidDismiss().then(v => {
      this.randomToken = Math.random() * 1000;
      if (v.role === 'success') {
        this.filterValues = v.data;
        if (this.filterValues) {
          const monthDate = new Date(this.filterValues?.month);
          this.selectedYear = monthDate.getFullYear();
          this.selectedMonth = monthDate.getMonth();
        } else {
          const monthDate = new Date();
          this.selectedYear = monthDate.getFullYear();
          this.selectedMonth = monthDate.getMonth();
        }
        this.refresh();
      }
    });
    pop.present();
  }

}
