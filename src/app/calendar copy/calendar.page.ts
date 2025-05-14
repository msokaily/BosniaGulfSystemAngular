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
  rows: RowData[]; // rows of days (each row contains 7 cells)
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
    console.log({ reservations: this.reservations, items: this.items });

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

  generateMonth(year: number, month: number): MonthData {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days: Day[] = this.generateDaysArray(firstDayIndex, totalDays);
    const rows: RowData[] = this.splitDaysIntoRows(days);
    const reservationBlocks: ReservationBlock[] = this.processReservations(year, month, firstDayIndex, totalDays, rows);
    this.assignReservationBlocksToRows(reservationBlocks, rows);

    return {
      month: new Date(year, month).toLocaleString('default', { month: 'long' }),
      year,
      rows,
    };
  }

  private generateDaysArray(firstDayIndex: number, totalDays: number): Day[] {
    const days: Day[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null });
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push({ day: i });
    }
    return days;
  }

  private splitDaysIntoRows(days: Day[]): RowData[] {
    const rows: RowData[] = [];
    const totalRows = Math.ceil(days.length / this.columns);
    for (let r = 0; r < totalRows; r++) {
      const rowDays = days.slice(r * this.columns, r * this.columns + this.columns);
      rows.push({
        days: rowDays,
        rowNumber: r,
        height: this.baseRowHeight,
        reservations: [],
      });
    }
    return rows;
  }

  private processReservations(year: number, month: number, firstDayIndex: number, totalDays: number, rows: RowData[]): ReservationBlock[] {
    const reservationBlocks: ReservationBlock[] = [];
    this.reservations.forEach(res => {
      const startDate = new Date(res.start_at);
      const endDate = new Date(res.end_at);

      // Check if the reservation starts in the current month
      if (startDate.getFullYear() === year && startDate.getMonth() === month) {
        const startDay = startDate.getDate();
        const endDay = endDate.getMonth() === month ? endDate.getDate() : totalDays; // Handle end date in the same month
        const totalSpan = endDay - startDay + 1;

        // Create reservation blocks for the current month
        this.createReservationBlocks(res, firstDayIndex, startDay, totalSpan, reservationBlocks);
      }

      // Check if the reservation starts in the previous month and ends in the current month
      const prevMonth = new Date(year, month - 1, 1);
      if (
        startDate.getFullYear() === prevMonth.getFullYear() &&
        startDate.getMonth() === prevMonth.getMonth() &&
        endDate.getFullYear() === year &&
        endDate.getMonth() === month
      ) {
        const startDay = 1; // Reservation starts from the first day of the current month
        const endDay = endDate.getDate();
        const totalSpan = endDay - startDay + 1;

        // Create reservation blocks for the current month
        this.createReservationBlocks(res, firstDayIndex, startDay, totalSpan, reservationBlocks);
      }
    });
    return reservationBlocks;
  }

  private createReservationBlocks(res: Reservation, firstDayIndex: number, startDay: number, totalSpan: number, reservationBlocks: ReservationBlock[]) {
    let cellIndex = firstDayIndex + startDay - 1;
    let remainingSpan = totalSpan;
    let currentRow = Math.floor(cellIndex / this.columns);
    let currentCol = cellIndex % this.columns;

    while (remainingSpan > 0) {
      const cellsRemainingInRow = this.columns - currentCol;
      const blockSpan = Math.min(remainingSpan, cellsRemainingInRow);
      const block: ReservationBlock = {
        ...res,
        resId: res.id as number,
        cellIndex,
        span: blockSpan,
        row: currentRow,
        stackIndex: 0,
        top: 0,
        left: 0,
        width: 0,
        color: this.getColorForId(res.item_id as number),
      };
      reservationBlocks.push(block);

      remainingSpan -= blockSpan;
      currentRow++;
      currentCol = 0;
      cellIndex = currentRow * this.columns;
    }
  }

  private assignReservationBlocksToRows(reservationBlocks: ReservationBlock[], rows: RowData[]) {
    const blocksByRow: { [row: number]: ReservationBlock[] } = {};
    reservationBlocks.forEach(block => {
      if (!blocksByRow[block.row]) {
        blocksByRow[block.row] = [];
      }
      blocksByRow[block.row].push(block);
    });
  
    // Track reservations that span multiple rows
    const crossRowReservations = new Set<number>();
    reservationBlocks.forEach(block => {
      if (block.span > (this.columns - (block.cellIndex % this.columns))) {
        crossRowReservations.add(block.resId);
      }
    });
  
    Object.keys(blocksByRow).forEach(rowKey => {
      const rowNumber = Number(rowKey);
      const blocks = blocksByRow[rowNumber];
  
      // Sort blocks:
      // 1. Cross-row reservations first (lower stackIndex)
      // 2. Then by reservation ID and column
      blocks.sort((a, b) => {
        const isACrossRow = crossRowReservations.has(a.resId);
        const isBCrossRow = crossRowReservations.has(b.resId);
  
        if (isACrossRow && !isBCrossRow) return -1; // a comes first
        if (!isACrossRow && isBCrossRow) return 1;  // b comes first
  
        // If both are cross-row or neither, sort by resId and column
        if (a.resId !== b.resId) {
          return a.resId - b.resId;
        }
        const colA = (a.cellIndex % this.columns);
        const colB = (b.cellIndex % this.columns);
        return colA - colB;
      });
  
      // Assign stack indices
      let currentStackIndex = -1;
      let lastResId: number | null = null;
      blocks.forEach(block => {
        if (lastResId === block.resId) {
          block.stackIndex = currentStackIndex;
        } else {
          currentStackIndex++;
          block.stackIndex = currentStackIndex;
          lastResId = block.resId;
        }
      });
  
      // Update row height based on the maximum stack index
      const extraHeight = (Math.max(...blocks.map(b => b.stackIndex)) + 1) * (this.reservationHeight + this.reservationVerticalGap);
      rows[rowNumber].height = this.baseRowHeight + extraHeight;
      rows[rowNumber].reservations = blocks;
    });
  
    // Update each reservation block with final computed top, left, and width
    reservationBlocks.forEach(block => {
      const col = block.cellIndex % this.columns;
      block.left = (col / this.columns) * 100;
      block.width = (block.span / this.columns) * 100;
      block.top = block.stackIndex * (this.reservationHeight + this.reservationVerticalGap);
    });
  }

  async edit(id: number, data?: any, errors?: any) {
    const index = this.items.findIndex(v => v?.id == id);
    if (this.user?.id === this.items[index]?.user_id || ['admin'].includes(this.user?.role)) {} else { return; };
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
          {id: 'accommodation', name: await this.shared.trans('accommodation')},
          {id: 'car', name: await this.shared.trans('car')},
          {id: 'driver', name: await this.shared.trans('driver')}
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
