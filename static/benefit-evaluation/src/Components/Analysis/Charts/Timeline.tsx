import { useEffect, useState, useRef } from 'react'
import { GoalTableItem } from '../../../Models/GoalStructureModel'
import Chart from 'react-apexcharts'
import PageHeader from '@atlaskit/page-header'
import { Label } from '@atlaskit/form'
import { Flex, Box, xcss } from '@atlaskit/primitives'
import Button from '@atlaskit/button'
import EditorAddIcon from '@atlaskit/icon/glyph/editor/add'
import EditorDividerIcon from '@atlaskit/icon/glyph/editor/divider'
import TextField from '@atlaskit/textfield'

type Props = {
    items: GoalTableItem[]
}

const Timeline = ({ items }: Props) => {
    const [seriesData, setSeriesData] = useState<any[]>([])
    const [minDate, setMinDate] = useState(0)
    const [maxDate, setMaxDate] = useState(0)
    const [workers, setWorkers] = useState(1)
    const [onHover, setOnHover] = useState(false)

    useEffect(() => {
        const data: any[] = []
        const worktime: number[] = []
        let maxTimeForwards: number = 0
        let max: number = 0
        items.forEach((item) => (maxTimeForwards += item.issueCost?.time!!))

        let actualWorkers = 1
        if (workers > 0) actualWorkers = workers
        for (let i = 0; i < maxTimeForwards; i++) worktime.push(actualWorkers)

        items.forEach((epic, index) => {
            let remainingWork = epic.issueCost?.time!!
            let startDate: null | Date = null
            for (let i = 0; i < worktime.length; i++) {
                if (worktime[i] > 0) {
                    if (startDate === null) {
                        startDate = new Date()
                        startDate.setHours(startDate!!.getHours() + i)
                    }

                    worktime[i]--
                    remainingWork--
                    if (remainingWork === 0) {
                        const endDate = new Date(startDate!!.getTime())
                        endDate.setHours(
                            endDate.getHours() + epic.issueCost?.time!!
                        )

                        // * Determine the lane
                        data.push({
                            name: epic.key,
                            data: [
                                {
                                    x: 'Backlog',
                                    y: [
                                        new Date().getTime() - 5 * 60000,
                                        startDate.getTime(),
                                    ],
                                    key: index,
                                },
                                {
                                    x: 'Development',
                                    y: [startDate.getTime(), endDate.getTime()],
                                    key: index,
                                },
                                {
                                    x: 'Production',
                                    y: [endDate.getTime(), endDate.getTime()],
                                    key: index,
                                },
                            ],
                        })

                        if (max < endDate.getTime())
                            max = endDate.getTime()
                        break
                    }
                }
            }
        })

        data.forEach((item: any) => {
            item.data[2].y[1] = max + 5 * 60000
        })

        setMinDate(new Date().getTime() - 10 * 60000)
        setMaxDate(max + 10 * 60000)
        setSeriesData(data)
        console.log(data)
    }, [items, workers])

    const state: any = {
        series: seriesData,
        options: {
            chart: {
                type: 'rangeBar',
                toolbar: {
                    show: false,
                },
                selection: {
                    enabled: false,
                },
                zoom: {
                    enabled: false,
                },
            },
            legend: {
                show: false,
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    dataLabels: {
                        hideOverflowingLabels: false,
                    },
                    barHeight: '20px',
                },
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    show: false,
                },
                min: minDate,
                max: maxDate,
            },
            yaxis: {
                show: true,
            },
            grid: {
                row: {
                    colors: ['rgba(192, 194, 196, 0.5)', 'transparent'],
                    opacity: 0.6,
                },
                padding: {
                    left: 0,
                    right: 0,
                },
            },
            pan: {
                enabled: false,
            },
            dataLabels: {
                enabled: true,
                formatter: function (
                    _: any,
                    opts: {
                        w: { globals: { labels: { [x: string]: any } } }
                        dataPointIndex: string | number
                        seriesIndex: number
                    }
                ) {
                    return items[Number(opts.seriesIndex)].key
                },
                style: {
                    colors: ['white'],
                },
            },
            tooltip: {
                enabled: true,
                custom: function ({ seriesIndex, dataPointIndex, w }: any) {
                    const data =
                        w.globals.initialSeries[seriesIndex].data[
                            dataPointIndex
                        ]

                    return `<div style="padding: 0.5rem; max-width: 20rem; overflow: visible;">
                        <span style="color: black; white-space: normal; font-weight: bold; overflow: visible;">
                            ${items[data.key].description}:
                        </span><br/><span style="color: black;">Time - ${Number(
                            (data.x != 'Development'
                                ? data.y[1] - data.y[0] - 5 * 60000
                                : data.y[1] - data.y[0]) /
                                (1000 * 60 * 60)
                        )}</span>
                    </div>`
                },
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 1500,
                animateGradually: {
                    enabled: true,
                    delay: 150,
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350,
                },
            },
        },
    }

    const workersRef = useRef<HTMLInputElement | null>(null)
    const changeWorkers = () => {
        if (workersRef.current) {
            let value = workersRef.current.value

            if (isNaN(+value) || Number(value) < 1) setWorkers(0)
            else if (Number(value) > 250) setWorkers(250)
            else setWorkers(Number(value))
        }
    }

    const somethingElseCellStyle = xcss({
        width: '100px',
        paddingLeft: 'space.100',
        height: '50px',
        paddingRight: 'space.100',
        display: 'flex',
        alignItems: 'center',
        cursor: 'text',
        backgroundColor: 'color.background.input.hovered',
        ':hover': {
            backgroundColor: 'color.background.input.hovered',
        },
        ':focus-within': {
            backgroundColor: 'color.background.selected',
        },
        marginBottom: '1rem',
    })

    return (
        <>
            <PageHeader>Timeline</PageHeader>
            <Label htmlFor="workers">Workers</Label>
            <Box
                xcss={somethingElseCellStyle}
                onMouseEnter={() => setOnHover(true)}
                onMouseLeave={() => setOnHover(false)}
            >
                <Button
                    style={{ opacity: onHover ? 100 : 0 }}
                    appearance="subtle-link"
                    iconBefore={<EditorDividerIcon label="subract" />}
                    size={50}
                    tabIndex={-1}
                    isDisabled={workers <= 1}
                    onClick={() => {
                        if (workers > 1)
                            setWorkers((currentValue) => currentValue - 1)
                    }}
                />
                <TextField
                    name="workers"
                    id="workers"
                    appearance="none"
                    autoComplete="off"
                    ref={workersRef}
                    value={workers === 0 ? '' : workers}
                    style={{
                        textAlign: 'center',
                    }}
                    onChange={changeWorkers}
                />
                <Button
                    style={{ opacity: onHover ? 100 : 0 }}
                    appearance="subtle-link"
                    iconBefore={<EditorAddIcon label="subract" />}
                    size={50}
                    tabIndex={-1}
                    isDisabled={workers >= 250}
                    onClick={() => {
                        if (workers < 250)
                            setWorkers((currentValue) => currentValue + 1)
                    }}
                />
            </Box>

            <Chart
                options={state.options}
                series={state.series}
                type="rangeBar"
                height={24 * state.series.length * 3}
            />
        </>
    )
}
export default Timeline
