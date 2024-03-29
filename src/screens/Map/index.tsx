import { useEffect, useState } from "react"
import s from "./map.module.scss"
import { FilterType, TimeType, service } from "../../utils/api/MapService"

import { getRoutesOptions, getBatchOptions } from "../../utils/api"

import Select, { SingleValue } from "react-select"
import {
    MapContainer,
    TileLayer,
    Popup,
    Circle,
    CircleMarkerProps,
    ImageOverlay,
    MapConsumer
} from "react-leaflet"

import L, {
    LatLngTuple,
    
} from 'leaflet'


import 'leaflet/dist/leaflet.css'

import x from '../../assets/x.png'
import Options from "../../components/Option"
import Tooltip from "../../components/Tooltip"

type Parameter = "people" | "annotated" | "boarding" | "alighting"

type Location = {
    x: number,
    y: number
}

type Stop = {
    parameter: Parameter
    location: Location
    number: number
}

type Following = {
    following: boolean
    location: Location
}

type RouteSelect = {
    value: number
    label: string
}



const Map = () => {

    const [route, setRoute] = useState("")
    const [routes, setRoutes] = useState<RouteSelect[]>([])

    const [filters, setFilters] = useState<FilterType>({
        people: false,
        boarding: false,
        alighting: false,
        annotated: false,
        following: false,
    })

    const [collapsed, setCollapsed] = useState(true)

    const [markers, setMarkers] = useState<JSX.Element[]>([])

    const [time, setTime] = useState<TimeType>('none')

    const timeToNumber = () => {
        switch (time) {
            case "none":
                return 0
            case "morning":
                return 1
            case "noon":
                return 2
            case "evening":
                return 3
            default:
                return 0
        }
    }

    useEffect(() => {
        console.log(time)
    }, [time])

    useEffect(() => {
        updateMarkers()
    }, [route, filters, time])

    const updateMarkers = () => {
        service.getFilteredStops(route, filters, time).then((data) => {
            generateMarkers(data)
        })
    }

    const generateMarkers = (data: {filtered: Stop[], following: Following[]}) => {
        let tempMarkers = []
        for (let i = 0; i < data.filtered.length; i++) {
            let color, coord, display
            if (data.filtered[i]) {
                switch (data.filtered[i].parameter) {
                    case 'annotated':
                        color = '#4DC274'
                        break
                    case 'boarding':
                        color = '#F7F603'
                        break
                    case 'alighting':
                        color = '#E20000'
                        break
                    default:
                        color = '#1A05F3'
                        break
                }
                coord = [data.filtered[i].location.x, data.filtered[i].location.y] as LatLngTuple
                display = data.filtered[i].number
                tempMarkers.push(
                    <Circle key={data.filtered[i]?.parameter + i} center={coord} color={color} radius={Math.ceil(display) * 15}>
                        <Popup>
                            {display}
                        </Popup>
                    </Circle>
                )
            }
        }
        let ctr = 0
        for (let i of data.following) {
            let coord = [i.location.x, i.location.y]
            tempMarkers.push(
                //<Marker key={key + i} position={coord} icon={xIcon} />
                <ImageOverlay key={`following-${ctr}`} url={x} bounds={[[coord[0] - .0004, coord[1] - .0004], [coord[0] + .0004, coord[1] + .0004]]} interactive={true} />
            )
            ctr += 1
        }
        setMarkers(tempMarkers)
    }

    useEffect(() => {
        console.log(markers)
    }, [markers])

    const handleSelectOpen = () => {
        getRoutesOptions().then((data) => {
            setRoutes([{value: 0, label: 'All'}].concat(data))
        })
    }

    const handleSelectChange = (event: SingleValue<{value: number; label: string; }>) => {
        if (event) {
            setRoute(event.label)
        }
    }

    const handleFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
        let checkedBox = event.target
        setFilters(curr => {
            let tempFilter = JSON.parse(JSON.stringify(curr))
            tempFilter[checkedBox.value] = checkedBox.checked
            return (tempFilter)
        })
    }

    const handleCollapse = () => {
        setCollapsed(!collapsed)
    }

    const handleTimeRange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let tempTime: TimeType
        switch (event.target.value) {
            case '0':
                tempTime = 'none'
                break
            case '1':
                tempTime = 'morning'
                break
            case '2':
                tempTime = 'noon'
                break
            case '3':
                tempTime = 'evening'
                break
            default:
                tempTime = 'none'
        }

        setTime(tempTime)
    }

    const getFirstMarkerLatLng = (firstMarker: any, center: any) => {
        if (firstMarker) {
            return firstMarker.props.center ? firstMarker.props.center : firstMarker.props.bounds[0]
        }

        return center
    }

    const handleTimeSelect = (time: TimeType) => {
        setTime(time)
    }

    return (
        <div id="mapContainer" className={s.container}>
            <MapContainer className={s.map} center={[11.803, 122.563]} zoom={5} scrollWheelZoom={true}>
                {<MapConsumer>
                    {(map) => {
                        let center = map.getCenter()
                        let zoom = map.getZoom()
                        if (markers.length) {
                            const firstMarker = markers[0]
                            map.flyTo(getFirstMarkerLatLng(firstMarker, center), Math.max(13, zoom), {duration: 0.25})
                            
                        }
                        return null
                    }}
                </MapConsumer>}
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {markers}
                <div className='leaflet-top leaflet-right' onClick={(event) => {event.stopPropagation()}}>
                    <div className={`leaflet-control leaflet-bar ${s.legend} ${collapsed ? s.legendCollapse : ''}`}>
                        {collapsed ?
                            <div className={s.arrow} onClick={handleCollapse} />
                        :
                        <>
                            <strong><span className={s.arrow} onClick={handleCollapse} style={{
                                width: '17px',
                                height: '17px',
                                marginRight: '5px'
                            }} />Legend & Control</strong><br />
                            <Select menuPortalTarget={document.getElementById("mapContainer")} placeholder={`Select route...`} isClearable onChange={handleSelectChange} className={s.select} options={routes} onMenuOpen={handleSelectOpen}/>
                            <div>
                                <input type="checkbox" id="people" name="people" value="people" onChange={handleFilter} checked={filters.people} />
                                <label htmlFor="people"><span className={s.dot} style={{backgroundColor: '#1A05F3'}}/>Total Passengers (Automated)</label>
                            </div>
                            <div>
                                <input type="checkbox" id="annotated" name="annotated" value="annotated" onChange={handleFilter} checked={filters.annotated} />
                                <label htmlFor="annotated"><span className={s.dot} style={{backgroundColor: '#4DC274'}}/>Total Passengers (Manual)</label>
                            </div>
                            <div>
                                <input type="checkbox" id="boarding" name="boarding" value="boarding" onChange={handleFilter} checked={filters.boarding} />
                                <label htmlFor="boarding"><span className={s.dot} style={{backgroundColor: '#F7F603'}}/>Boarding (Manual)</label>
                            </div>
                            <div>
                                <input type="checkbox" id="alighting" name="alighting" value="alighting" onChange={handleFilter} checked={filters.alighting} />
                                <label htmlFor="alighting"><span className={s.dot} style={{backgroundColor: '#E20000'}}/>Alighting (Manual)</label>
                            </div>
                            <div>
                                <input type="checkbox" id="following" name="following" value="following" onChange={handleFilter} checked={filters.following} />
                                <label htmlFor="following">&#10060; COVID Regulations Violations (Manual)</label>
                            </div>
                            <div style={{
                                margin: `8px 0px 0px 16px`
                            }}>
                                <Options<TimeType> options={[
                                    {label: 'None', value: "none", color: "#62A2CC"},
                                    {label: <Tooltip iClass={s.tooltipContainer} className={s.tooltip} label={'Morning'}>{`12AM-8AM`}</Tooltip>, value: "morning", color: "#5C777F"},
                                    {label: <Tooltip className={s.tooltip} label={'Noon'}>{`8AM-4PM`}</Tooltip>, value: "noon", color: "#FFB449"},
                                    {label: <Tooltip className={s.tooltip} label={'Evening'}>{`4PM-11:59PM`}</Tooltip>, value: "evening", color: "#2B2C5A"},
                                ]}
                                    defaultOption={{label: 'None', value: "none"}}
                                    onSelect={handleTimeSelect}
                                />
                            </div>
                        </>}
                    </div>
                </div>
            </MapContainer>
        </div>
    )
}

export default Map